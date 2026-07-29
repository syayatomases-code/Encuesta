"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EncuestaForm({ user }) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // Estado con todas las variables clínicas de las 4 secciones
  const [formData, setFormData] = useState({
    // Sección 1: Demográficos y Antecedentes
    nombre: "",
    edad: "",
    identificacion: "",
    ocupacion: "",
    traumatismo_ craneo: "No",
    antecedentes_familiares: "Ninguno",
    medicamentos_actuales: "Ninguno",
    sustancias: "Ninguno",
    hipertension: "No",
    diabetes: "No",
    tiroides: "Ninguno",
    cirugias_previas: "No",
    exposicion_toxica: "No",
    lateralidad: "Diestro",

    // Sección 2: Síntomas y Trastornos
    dolor_cabeza: "No presento",
    intensidad_dolor: "1",
    tipo_dolor: "Opresivo",
    aura_visual: "No",
    frecuencia_fatiga: "3",
    problemas_sueno: "No",
    debilidad_extremidades: "Nunca",
    parestesias: "Ninguno",
    vertigo: "Raros",
    problemas_equilibrio: "No",
    sincope: "No",
    convulsiones: "No",
    cambios_vision: "No",
    acufenos: "No",
    sensibilidad_luz_ruido: "No",

    // Sección 3: Cognición y Conducta
    memoria_corto_plazo: "Ninguna",
    anomia: "No",
    desorientacion: "No",
    concentracion: "Nunca",
    cambios_humor: "No",
    apatia: "No",
    dificultad_planificar: "No",
    trastornos_marcha: "No",
    temblor_reposo: "No",
    dificultad_hablar: "No",

    // Sección 4: Sistema Nervioso y Cierre
    anosmia: "No",
    problemas_deglucion: "No",
    cambios_sudoracion: "No",
    problemas_esfinteres: "No",
    observaciones: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (paso === 1) {
      if (!formData.nombre || !formData.edad || !formData.identificacion) {
        alert("Por favor, completa los campos obligatorios (*)");
        return;
      }
    }
    setPaso((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnterior = () => {
    setPaso((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const { error } = await supabase.from("respuestas").insert([
        {
          user_id: user.id,
          data: formData,
        },
      ]);

      if (error) throw error;

      localStorage.removeItem("cuestionario_en_curso");
      router.replace("/gracias");
    } catch (error) {
      console.error("Error al guardar la encuesta:", error.message);
      alert("Hubo un error al enviar el formulario. Inténtalo de nuevo.");
      setEnviando(false);
    }
  };

  // Cálculo del progreso dinámico para 4 secciones (0%, 33%, 66%, 100%)
  const porcentajeProgreso = paso === 1 ? 0 : paso === 2 ? 33 : paso === 3 ? 66 : 100;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Cabecera Clínica */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-md shadow-sky-600/20 font-bold">
            🧠
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Evaluación Neurológica Especializada</h1>
          <p className="text-xs text-sky-600 font-semibold tracking-wider uppercase mt-1">
            Centro de Neurología Avanzada
          </p>
        </div>

        {/* Tarjeta Contenedora Principal */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-10">
          
          {/* Barra de Progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              <span>Sección {paso} de 4</span>
              <span className="text-sky-600">{porcentajeProgreso}% Completado</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-500 rounded-full"
                style={{ width: `${porcentajeProgreso}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={paso === 4 ? handleSubmit : handleSiguiente} className="space-y-6">

            {/* ================= SECCIÓN 1: DATOS Y ANTECEDENTES ================= */}
            {paso === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">1. Datos Demográficos y Antecedentes Generales</h2>
                  <p className="text-xs text-slate-500">Información básica de identificación y antecedentes médicos generales.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nombre Completo del Paciente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Carlos Martínez Pérez"
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Edad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="edad"
                      required
                      min="1"
                      max="120"
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder="Ej. 45"
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Número de Identificación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="identificacion"
                      required
                      value={formData.identificacion}
                      onChange={handleChange}
                      placeholder="Cédula o Documento"
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Ocupación Actual</label>
                  <input
                    type="text"
                    name="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleChange}
                    placeholder="Ej. Ingeniero, Docente..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">¿Antecedentes de Golpes Fuertes en Cabeza?</label>
                    <select name="traumatismo_craneo" value={formData.traumatismo_craneo} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Lateralidad (Mano dominante)</label>
                    <select name="lateralidad" value={formData.lateralidad} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500">
                      <option value="Diestro">Diestro</option>
                      <option value="Zurdo">Zurdo</option>
                      <option value="Ambidextro">Ambidextro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Hipertensión</label>
                    <select name="hipertension" value={formData.hipertension} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Diabetes</label>
                    <select name="diabetes" value={formData.diabetes} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Problemas Tiroides</label>
                    <select name="tiroides" value={formData.tiroides} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Ninguno">Ninguno</option>
                      <option value="Hipotiroidismo">Hipotiroidismo</option>
                      <option value="Hipertiroidismo">Hipertiroidismo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Antecedentes Familiares Neurológicos (Alzheimer, Parkinson, etc.)</label>
                  <input type="text" name="antecedentes_familiares" value={formData.antecedentes_familiares} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
            )}

            {/* ================= SECCIÓN 2: SÍNTOMAS Y TRASTORNOS ================= */}
            {paso === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">2. Síntomas y Trastornos Neurológicos Frecuentes</h2>
                  <p className="text-xs text-slate-500">Evaluación de dolores, fatiga y alteraciones sensitivas o motoras.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Frecuencia de dolores de cabeza o migrañas</label>
                  <select name="dolor_cabeza" value={formData.dolor_cabeza} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                    <option value="No presento">No presento</option>
                    <option value="Ocasional">Ocasional</option>
                    <option value="Frecuente">Frecuente</option>
                    <option value="Crónico">Crónico</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Intensidad del Dolor (1 al 10)</label>
                    <input type="number" min="1" max="10" name="intensidad_dolor" value={formData.intensidad_dolor} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Características del Dolor</label>
                    <select name="tipo_dolor" value={formData.tipo_dolor} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Opresivo">Opresivo</option>
                      <option value="Pulsátil">Pulsátil</option>
                      <option value="Punziante">Punziante</option>
                      <option value="Generalizado">Generalizado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nivel de Fatiga Mental / Cansancio Cognitivo (1 al 5)</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <input type="range" name="frecuencia_fatiga" min="1" max="5" value={formData.frecuencia_fatiga} onChange={handleChange} className="w-full accent-sky-600" />
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 font-bold text-sm rounded-lg">Nivel {formData.frecuencia_fatiga}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Problemas graves de sueño</label>
                    <select name="problemas_sueno" value={formData.problemas_sueno} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí, frecuentemente</option>
                      <option value="No">No, duermo bien</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sensación de debilidad en extremidades</label>
                    <select name="debilidad_extremidades" value={formData.debilidad_extremidades} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Nunca">Nunca</option>
                      <option value="Ocasionalmente">Ocasionalmente</option>
                      <option value="Frecuentemente">Frecuentemente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mareos / Vértigo</label>
                    <select name="vertigo" value={formData.vertigo} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Raros">Raros</option>
                      <option value="Frecuentes">Frecuentes</option>
                      <option value="Ninguno">Ninguno</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Problemas Equilibrio</label>
                    <select name="problemas_equilibrio" value={formData.problemas_equilibrio} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Zumbidos Oídos (Acúfenos)</label>
                    <select name="acufenos" value={formData.acufenos} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SECCIÓN 3: COGNICIÓN Y CONDUCTA ================= */}
            {paso === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">3. Funciones Cognitivas, Memoria y Conducta</h2>
                  <p className="text-xs text-slate-500">Evaluación de memoria, lenguaje y cambios conductuales.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Dificultad memoria a corto plazo</label>
                    <select name="memoria_corto_plazo" value={formData.memoria_corto_plazo} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Ninguna">Ninguna</option>
                      <option value="Leve">Leve</option>
                      <option value="Moderada">Moderada</option>
                      <option value="Severa">Severa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Problemas para encontrar palabras (Anomia)</label>
                    <select name="anomia" value={formData.anomia} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Dificultad de concentración diaria</label>
                    <select name="concentracion" value={formData.concentracion} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Nunca">Nunca</option>
                      <option value="A veces">A veces</option>
                      <option value="Con frecuencia">Con frecuencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Cambios drásticos de humor / Irritabilidad</label>
                    <select name="cambios_humor" value={formData.cambios_humor} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Temblor involuntario en reposo</label>
                    <select name="temblor_reposo" value={formData.temblor_reposo} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Dificultad para hablar o articular palabras</label>
                    <select name="dificultad_hablar" value={formData.dificultad_hablar} onChange={handleChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SECCIÓN 4: SISTEMA NERVIOSO Y CIERRE ================= */}
            {paso === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">4. Sistema Nervioso Autónomo y Observaciones</h2>
                  <p className="text-xs text-slate-500">Últimos detalles clínicos y comentarios adicionales.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Pérdida de Olfato (Anosmia)</label>
                    <select name="anosmia" value={formData.anosmia} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Problemas al Tragar (Deglución)</label>
                    <select name="problemas_deglucion" value={formData.problemas_deglucion} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Control de Esfínteres</label>
                    <select name="problemas_esfinteres" value={formData.problemas_esfinteres} onChange={handleChange} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Observaciones Adicionales o Comentarios
                  </label>
                  <textarea
                    name="observaciones"
                    rows="4"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Describa medicamentos, detalles o síntomas adicionales..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  ></textarea>
                </div>

                <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-xl">
                  <p className="text-xs text-sky-800 font-medium">
                    ⚠️ Al hacer clic en <strong>"Enviar Evaluación"</strong>, sus datos completos quedarán registrados y su sesión se cerrará de forma segura.
                  </p>
                </div>
              </div>
            )}

            {/* Botones de Navegación */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={handleAnterior}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  ← Anterior
                </button>
              ) : (
                <div></div>
              )}

              {paso < 4 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-sky-600/20"
                >
                  Siguiente Sección →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={enviando}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {enviando ? "Enviando expediente..." : "✓ Enviar Evaluación"}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}