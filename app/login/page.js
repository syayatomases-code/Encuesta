"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { seccionesPreguntas } from "@/lib/preguntas";

export default function AdminPage() {
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    fetchRespuestas();
  }, []);

  const fetchRespuestas = async () => {
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Panel de Administración - Evaluaciones Neurológicas</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de expedientes clínicos recibidos</p>
        </header>

        {loading ? (
          <p className="text-slate-600 text-sm">Cargando expedientes...</p>
        ) : respuestas.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500 text-sm">No hay evaluaciones registradas todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lista de Pacientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3 overflow-y-auto max-h-[75vh]">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-2">Pacientes Evaluados ({respuestas.length})</h2>
              {respuestas.map((item) => {
                const nombrePaciente = item.data?.nombre || "Sin nombre";
                const fecha = new Date(item.created_at).toLocaleDateString();
                return (
                  <div
                    key={item.id}
                    onClick={() => setSeleccionado(item)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      seleccionado?.id === item.id
                        ? "bg-sky-50 border-sky-300 shadow-sm"
                        : "bg-slate-50/50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-800">{nombrePaciente}</p>
                    <div className="flex justify-between items-center mt-1 text-xs text-slate-500">
                      <span>ID: {item.data?.identificacion || "N/A"}</span>
                      <span>{fecha}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detalle del Expediente Seleccionado */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto max-h-[75vh]">
              {seleccionado ? (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{seleccionado.data?.nombre}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Documento: <strong className="text-slate-700">{seleccionado.data?.identificacion}</strong> | Edad: <strong className="text-slate-700">{seleccionado.data?.edad} años</strong>
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">Completado</span>
                  </div>

                  {/* Iterar sobre las secciones y sus campos usando lib/preguntas.js */}
                  {Object.entries(seccionesPreguntas).map(([secKey, seccion]) => (
                    <div key={secKey} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 p-2 rounded-lg">
                        {seccion.titulo}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {Object.keys(seccion.campos).map((campoKey) => {
                          const valor = seleccionado.data?.[campoKey];
                          if (valor === undefined || valor === "") return null;
                          return (
                            <div key={campoKey} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">{seccion.campos[campoKey].label}</span>
                              <span className="text-slate-800 font-medium text-xs mt-0.5 block">{valor}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-12">
                  <p className="text-slate-400 text-sm">Selecciona un paciente de la lista para ver su expediente clínico detallado.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}