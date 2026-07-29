"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);

  useEffect(() => {
    async function obtenerRespuestas() {
      try {
        const { data, error } = await supabase
          .from("respuestas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRespuestas(data || []);
      } catch (error) {
        console.error("Error al cargar respuestas:", error.message);
      } finally {
        setCargando(false);
      }
    }

    obtenerRespuestas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
            <p className="text-xs text-slate-500 mt-1">Expedientes y evaluaciones neurológicas registradas</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>

        {/* Listado */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Evaluaciones Recibidas</h2>

          {cargando ? (
            <p className="text-sm text-slate-500 text-center py-8">Cargando expedientes...</p>
          ) : respuestas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No hay evaluaciones registradas todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Paciente</th>
                    <th className="pb-3 px-3">Identificación</th>
                    <th className="pb-3 px-3">Fecha</th>
                    <th className="pb-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {respuestas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {item.data?.nombre || "Sin nombre"}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.data?.identificacion || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setRespuestaSeleccionada(item)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          Ver Expediente
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal de Detalle Dinámico */}
      {respuestaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Expediente Completo de Evaluación</h3>
              <button
                onClick={() => setRespuestaSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Listado dinámico automático de todas las preguntas guardadas */}
            <div className="space-y-3">
              {respuestaSeleccionada.data && Object.keys(respuestaSeleccionada.data).length > 0 ? (
                Object.entries(respuestaSeleccionada.data).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">
                      {key.replace(/_/g, " ")}
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      {value !== "" && value !== null ? String(value) : "No especificado"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No hay datos registrados en este expediente.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setRespuestaSeleccionada(null)}
                className="px-5 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}