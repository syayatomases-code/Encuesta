"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EncuestaForm({ user }) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // Estado que almacena todas las respuestas de la evaluación neurológica
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    identificacion: "",
    ocupacion: "",
    dolor_cabeza: "No especificado",
    frecuencia_fatiga: "3",
    problemas_sueno: "No",
    observaciones: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiguiente = (e) => {
    e.preventDefault();
    // Validaciones básicas de campos obligatorios en el paso 1
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
      // Guardar en la tabla 'respuestas' de Supabase asociando el ID del usuario
      const { error } = await supabase.from("respuestas").insert([
        {
          user_id: user.id,
          data: formData,
        },
      ]);

      if (error) throw error;

      // Limpiar rastro de seguridad del cuestionario en curso y redirigir a gracias
      localStorage.removeItem("cuestionario_en_curso");
      router.replace("/gracias");
    } catch (error) {
      console.error("Error al guardar la encuesta:", error.message);
      alert("Hubo un error al enviar el formulario. Inténtalo de nuevo.");
      setEnviando(false);
    }
  };

  // Cálculo del porcentaje de progreso
  const porcentajeProgreso = Math.round((paso / 3) * 100);

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

        {/* Tarjeta Contenedora Principal del Formulario */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-10">
          
          {/* Barra de Progreso Superior */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              <span>Sección {paso} de 3</span>
              <span className="text-sky-600">{porcentajeProgreso}% Completado</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-500 rounded-full"
                style={{ width: `${porcentajeProgreso}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={paso === 3 ? handleSubmit : handleSiguiente} className="space-y-6">

            {/* ================= PASO 1: DATOS PERSONALES ================= */}
            {paso === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">1. Datos Personales y Demográficos</h2>
                  <p className="text-xs text-slate-500">Ingrese la información básica de identificación del paciente.</p>
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
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50/50 transition-all"
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
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50/50 transition-all"
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
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Ocupación Actual
                  </label>
                  <input
                    type="text"
                    name="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleChange}
                    placeholder="Ej. Ingeniero, Docente, Independiente..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* ================= PASO 2: SÍNTOMAS Y CLÍNICA ================= */}
            {paso === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">2. Síntomas Neurológicos Frecuentes</h2>
                  <p className="text-xs text-slate-500">Seleccione las opciones que mejor describan su condición actual.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    ¿Presenta dolores de cabeza recurrentes o migrañas?
                  </label>
                  <select
                    name="dolor_cabeza"
                    value={formData.dolor_cabeza}
                    onChange={handleChange}
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50 transition-all"
                  >
                    <option value="No">No presento</option>
                    <option value="Ocasional">Ocasional (1 vez al mes o menos)</option>
                    <option value="Frecuente">Frecuente (Varias veces por semana)</option>
                    <option value="Crónico">Crónico (Constante / Diario)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Nivel percibido de Fatiga Mental / Cansancio Cognitivo (1 al 5)
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <input
                      type="range"
                      name="frecuencia_fatiga"
                      min="1"
                      max="5"
                      value={formData.frecuencia_fatiga}
                      onChange={handleChange}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 font-bold text-sm rounded-lg min-w-[60px] text-center">
                      Nivel {formData.frecuencia_fatiga}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    ¿Experimenta problemas graves para conciliar o mantener el sueño?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Sí", "No"].map((opcion) => (
                      <label
                        key={opcion}
                        className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-medium text-sm transition-all ${
                          formData.problemas_sueno === opcion
                            ? "bg-sky-50 border-sky-500 text-sky-700 shadow-sm"
                            : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="problemas_sueno"
                          value={opcion}
                          checked={formData.problemas_sueno === opcion}
                          onChange={handleChange}
                          className="hidden"
                        />
                        {opcion === "Sí" ? "Sí, frecuentemente" : "No, duermo bien"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= PASO 3: OBSERVACIONES Y CIERRE ================= */}
            {paso === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-slate-800">3. Observaciones Adicionales</h2>
                  <p className="text-xs text-slate-500">Agregue cualquier detalle clínico relevante que el especialista deba conocer.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Comentarios o síntomas adicionales (Opcional)
                  </label>
                  <textarea
                    name="observaciones"
                    rows="4"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Describa brevemente si toma algún medicamento o si ha notado cambios recientes..."
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-slate-50/50 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-xl">
                  <p className="text-xs text-sky-800 leading-relaxed font-medium">
                    ⚠️ Al hacer clic en <strong>"Enviar Evaluación"</strong>, sus respuestas quedarán registradas de forma definitiva en el sistema del Centro de Neurología y su sesión se cerrará de manera segura.
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
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors shadow-sm"
                >
                  ← Anterior
                </button>
              ) : (
                <div></div>
              )}

              {paso < 3 ? (
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
                  {enviando ? "Enviando respuestas..." : "✓ Enviar Evaluación"}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}