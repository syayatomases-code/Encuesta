"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { SECCIONES } from "@/lib/preguntas";

const TIEMPO_INACTIVIDAD_MS = 10 * 60 * 1000; // 10 minutos

export default function CuestionarioPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [seccionActual, setSeccionActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [validacionError, setValidacionError] = useState(null);
  const timerInactividad = useRef(null);

  // Verificar sesión y si ya respondió al cargar la página
  useEffect(() => {
    const verificarAcceso = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.replace("/login");
        return;
      }

      // Validar si ya respondió previamente
      const { data: respuestaExistente } = await supabase
        .from("respuestas")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (respuestaExistente) {
        router.replace("/ya-respondido");
        return;
      }

      setUser(session.user);
    };

    verificarAcceso();
  }, [router]);

  const STORAGE_KEY = user?.id ? `encuesta_draft_${user.id}` : null;

  // Cargar borrador local
  useEffect(() => {
    if (STORAGE_KEY) {
      const borradorGuardado = localStorage.getItem(STORAGE_KEY);
      if (borradorGuardado) {
        try {
          setRespuestas(JSON.parse(borradorGuardado));
        } catch (e) {
          console.error("Error al leer borrador local", e);
        }
      }
    }
  }, [STORAGE_KEY]);

  const handleInputChange = (idPregunta, valor) => {
    const nuevasRespuestas = { ...respuestas, [idPregunta]: valor };
    setRespuestas(nuevasRespuestas);
    if (STORAGE_KEY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasRespuestas));
    }
  };

  // Cierre por inactividad
  const cerrarSesionPorInactividad = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const reiniciarTimerInactividad = () => {
    if (timerInactividad.current) clearTimeout(timerInactividad.current);
    timerInactividad.current = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_MS);
  };

  useEffect(() => {
    const eventos = ["mousemove", "keydown", "scroll", "click"];
    eventos.forEach((evt) => window.addEventListener(evt, reiniciarTimerInactividad));
    reiniciarTimerInactividad();

    return () => {
      eventos.forEach((evt) => window.removeEventListener(evt, reiniciarTimerInactividad));
      if (timerInactividad.current) clearTimeout(timerInactividad.current);
    };
  }, []);

  const seccion = SECCIONES[seccionActual];
  const esUltimaSeccion = seccionActual === SECCIONES.length - 1;

  // Validar solo campos requeridos
  const validarSeccionActual = () => {
    for (const preg of seccion.preguntas) {
      if (preg.requerido) {
        const valor = respuestas[preg.id];
        if (valor === undefined || valor === null || valor.toString().trim() === "") {
          return false;
        }
      }
    }
    return true;
  };

  const handleSiguienteSeccion = (e) => {
    e.preventDefault();
    setValidacionError(null);

    if (!validarSeccionActual()) {
      setValidacionError("Por favor completa todas las preguntas obligatorias de esta sección.");
      return;
    }

    setSeccionActual((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidacionError(null);

    if (!validarSeccionActual()) {
      setValidacionError("Por favor completa las preguntas obligatorias antes de enviar.");
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
        router.replace("/ya-respondido");
      } else {
        setError(`Error al guardar: ${insertError.message}`);
      }
      return;
    }

    if (STORAGE_KEY) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCargando(false);
    router.replace("/gracias");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">
        Cargando sesión...
      </div>
    );
  }

  const porcentajeProgreso = Math.round(((seccionActual) / SECCIONES.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
        {/* Barra de Progreso */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Sección {seccionActual + 1} de {SECCIONES.length}</span>
            <span>{porcentajeProgreso}% COMPLETADO</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-600 h-full transition-all duration-300"
              style={{ width: `${((seccionActual + 1) / SECCIONES.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">{seccion.titulo}</h2>
          <p className="text-sm text-slate-500 mt-1">{seccion.descripcion}</p>
        </div>

        <form onSubmit={esUltimaSeccion ? handleSubmit : handleSiguienteSeccion}>
          <div className="space-y-6">
            {seccion.preguntas.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  {p.label} {p.requerido && <span className="text-red-500">*</span>}
                </label>

                {p.type === "text" && (
                  <input
                    type="text"
                    value={respuestas[p.id] || ""}
                    onChange={(e) => handleInputChange(p.id, e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                )}

                {p.type === "number" && (
                  <input
                    type="number"
                    min={p.min}
                    max={p.max}
                    value={respuestas[p.id] || ""}
                    onChange={(e) => handleInputChange(p.id, e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                )}

                {p.type === "textarea" && (
                  <textarea
                    rows={3}
                    value={respuestas[p.id] || ""}
                    onChange={(e) => handleInputChange(p.id, e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
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
    </div>
  );
}