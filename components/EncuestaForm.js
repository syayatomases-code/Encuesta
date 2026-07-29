"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// AQUÍ DEFINIMOS LAS SECCIONES Y PREGUNTAS
const SECCIONES = [
  {
    id: "datos_personales",
    titulo: "1. Datos Personales y Demográficos",
    descripcion: "Ingrese la información básica del paciente.",
    preguntas: [
      { id: "nombre", label: "Nombre completo del paciente", type: "text" },
      { id: "edad", label: "Edad", type: "number" },
      { id: "documento", label: "Número de identificación", type: "text" },
    ],
  },
  {
    id: "historial_clinico",
    titulo: "2. Antecedentes Médicos",
    descripcion: "Seleccione las condiciones previas relevantes.",
    preguntas: [
      { id: "antecedentes_fisiologicos", label: "Antecedentes de importancia", type: "textarea" },
      { id: "medicamentos_actuales", label: "Medicamentos que toma actualmente", type: "textarea" },
    ],
  },
  {
    id: "evaluacion_sintomas",
    titulo: "3. Evaluación de Síntomas",
    descripcion: "Marque la frecuencia de los siguientes episodios.",
    preguntas: [
      { 
        id: "dolor_cabeza", 
        label: "¿Ha experimentado dolores de cabeza frecuentes?", 
        type: "select", 
        options: ["Nunca", "Rara vez", "Frecuentemente", "A diario"] 
      },
      { 
        id: "alteracion_sueno", 
        label: "¿Presenta alteraciones en el patrón de sueño?", 
        type: "select", 
        options: ["No", "Insomnio leve", "Insomnio severo", "Hipersomnia"] 
      },
    ],
  },
];

const TIEMPO_INACTIVIDAD_MS = 5 * 60 * 1000; // 5 minutos de inactividad máxima

export default function EncuestaForm({ user }) {
  const router = useRouter();
  const [seccionActual, setSeccionActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [validacionError, setValidacionError] = useState(null);
  const timerInactividad = useRef(null);

  const STORAGE_KEY = `encuesta_draft_${user?.id}`;

  // 1. Cargar borrador guardado en localStorage
  useEffect(() => {
    if (user?.id) {
      const borradorGuardado = localStorage.getItem(STORAGE_KEY);
      if (borradorGuardado) {
        try {
          setRespuestas(JSON.parse(borradorGuardado));
        } catch (e) {
          console.error("Error al leer borrador local", e);
        }
      }
    }
  }, [user, STORAGE_KEY]);

  // 2. Guardar borrador en cada cambio
  const handleInputChange = (idPregunta, valor) => {
    const nuevasRespuestas = { ...respuestas, [idPregunta]: valor };
    setRespuestas(nuevasRespuestas);
    if (user?.id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasRespuestas));
    }
  };

  // 3. Cierre por inactividad
  const cerrarSesionPorInactividad = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const reiniciarTimerInactividad = () => {
    if (timerInactividad.current) clearTimeout(timerInactividad.current);
    timerInactividad.current = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_MS);
  };

  useEffect(() => {
    const eventos = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    eventos.forEach((evt) => window.addEventListener(evt, reiniciarTimerInactividad));
    reiniciarTimerInactividad();

    return () => {
      eventos.forEach((evt) => window.removeEventListener(evt, reiniciarTimerInactividad));
      if (timerInactividad.current) clearTimeout(timerInactividad.current);
    };
  }, []);

  const seccion = SECCIONES[seccionActual];
  const esUltimaSeccion = seccionActual === SECCIONES.length - 1;

  // 4. Validar que todas las preguntas de la sección estén respondidas
  const validarSeccionActual = () => {
    for (const preg of seccion.preguntas) {
      const valor = respuestas[preg.id];
      if (valor === undefined || valor === null || valor.toString().trim() === "") {
        return false;
      }
    }
    return true;
  };

  const handleSiguienteSeccion = (e) => {
    e.preventDefault();
    setValidacionError(null);

    if (!validarSeccionActual()) {
      setValidacionError("Por favor responde todas las preguntas de esta sección para poder continuar.");
      return;
    }

    setSeccionActual((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidacionError(null);

    if (!validarSeccionActual()) {
      setValidacionError("Por favor responde todas las preguntas antes de enviar la evaluación.");
      return;
    }

    setCargando(true);
    setError(null);

    const { error: insertError } = await supabase.from("respuestas").insert([
      {
        user_id: user.id,
        data: respuestas,
      },
    ]);

    if (insertError) {
      setCargando(false);
      if (insertError.code === "23505") {
        setError("Ya has enviado una respuesta anteriormente.");
      } else {
        setError(`Error al guardar en Supabase: ${insertError.message}`);
      }
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setCargando(false);
    alert("Evaluación enviada con éxito.");
    router.push("/gracias");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-slate-100 my-8">
      {/* Barra de Progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Sección {seccionActual + 1} de {SECCIONES.length}</span>
          <span>{Math.round(((seccionActual + 1) / SECCIONES.length) * 100)}% Completado</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-600 h-full transition-all duration-300"
            style={{ width: `${((seccionActual + 1) / SECCIONES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Encabezado */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">{seccion.titulo}</h2>
        <p className="text-sm text-slate-500 mt-1">{seccion.descripcion}</p>
      </div>

      {/* Formulario */}
      <form onSubmit={esUltimaSeccion ? handleSubmit : handleSiguienteSeccion}>
        <div className="space-y-6">
          {seccion.preguntas.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                {p.label} <span className="text-red-500">*</span>
              </label>

              {p.type === "text" && (
                <input
                  type="text"
                  value={respuestas[p.id] || ""}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}

              {p.type === "number" && (
                <input
                  type="number"
                  value={respuestas[p.id] || ""}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}

              {p.type === "textarea" && (
                <textarea
                  rows={3}
                  value={respuestas[p.id] || ""}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}

              {p.type === "select" && (
                <select
                  value={respuestas[p.id] || ""}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="">-- Seleccione una opción --</option>
                  {p.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Alerta de campos incompletos */}
        {validacionError && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-lg">
            ⚠️ {validacionError}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={seccionActual === 0}
            onClick={() => {
              setValidacionError(null);
              setSeccionActual((prev) => prev - 1);
            }}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40"
          >
            ← Sección Anterior
          </button>

          {esUltimaSeccion ? (
            <button
              type="submit"
              disabled={cargando}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-md disabled:opacity-50"
            >
              {cargando ? "Guardando..." : "Finalizar y Enviar"}
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-md"
            >
              Siguiente Sección →
            </button>
          )}
        </div>
      </form>
    </div>
  );
}