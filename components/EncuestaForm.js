"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { seccionesPreguntas } from "@/lib/preguntas";

export default function EncuestaForm({ user }) {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // Inicializar formData dinámicamente desde el archivo de preguntas
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    Object.values(seccionesPreguntas).forEach((seccion) => {
      Object.keys(seccion.campos).forEach((campo) => {
        initialData[campo] = campo === "edad" || campo === "intensidad_dolor" ? "" : 
                             campo === "frecuencia_fatiga" ? "3" : 
                             campo === "observaciones" ? "" : "No"; 
      });
    });
    // Ajustes específicos por defecto que tenías
    initialData.traumatismo_craneo = "No";
    initialData.antecedentes_familiares = "Ninguno";
    initialData.medicamentos_actuales = "Ninguno";
    initialData.sustancias = "Ninguno";
    initialData.tiroides = "Ninguno";
    initialData.lateralidad = "Diestro";
    initialData.dolor_cabeza = "No presento";
    initialData.intensidad_dolor = "1";
    initialData.tipo_dolor = "Opresivo";
    initialData.memoria_corto_plazo = "Ninguna";
    initialData.concentracion = "Nunca";
    initialData.vertigo = "Raros";
    return initialData;
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

  const porcentajeProgreso = paso === 1 ? 0 : paso === 2 ? 33 : paso === 3 ? 66 : 100;
  const seccionActualKey = `seccion${paso}`;
  const seccionData = seccionesPreguntas[seccionActualKey];

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
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-800">{seccionData.titulo}</h2>
                <p className="text-xs text-slate-500">{seccionData.descripcion}</p>
              </div>

              {/* Renderizado dinámico de los campos según la sección */}
              {Object.entries(seccionData.campos).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    {config.label} {config.requerido && <span className="text-red-500">*</span>}
                  </label>

                  {config.tipo === "text" || config.tipo === "number" ? (
                    <input
                      type={config.tipo}
                      name={key}
                      required={config.requerido || false}
                      min={config.min}
                      max={config.max}
                      value={formData[key]}
                      onChange={handleChange}
                      placeholder={config.placeholder || ""}
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ) : config.tipo === "select" ? (
                    <select
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {config.opciones.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  ) : config.tipo === "range" ? (
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <input
                        type="range"
                        name={key}
                        min={config.min}
                        max={config.max}
                        value={formData[key]}
                        onChange={handleChange}
                        className="w-full accent-sky-600"
                      />
                      <span className="px-3 py-1 bg-sky-100 text-sky-700 font-bold text-sm rounded-lg">Nivel {formData[key]}</span>
                    </div>
                  ) : config.tipo === "textarea" ? (
                    <textarea
                      name={key}
                      rows="4"
                      value={formData[key]}
                      onChange={handleChange}
                      placeholder={config.placeholder}
                      className="w-full border border-slate-200 p-3 rounded-xl text-sm text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    ></textarea>
                  ) : null}
                </div>
              ))}

              {paso === 4 && (
                <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-xl mt-4">
                  <p className="text-xs text-sky-800 font-medium">
                    ⚠️ Al hacer clic en <strong>"Enviar Evaluación"</strong>, sus datos completos quedarán registrados y su sesión se cerrará de forma segura.
                  </p>
                </div>
              )}
            </div>

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