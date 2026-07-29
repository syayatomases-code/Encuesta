"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    const verificarAdminYCargar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Validar rol en perfiles
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", session.user.id)
        .maybeSingle();

      if (perfil?.rol !== "admin") {
        router.replace("/cuestionario");
        return;
      }

      // Cargar respuestas
      const { data, error } = await supabase
        .from("respuestas")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRespuestas(data);
      }
      setCargando(false);
    };

    verificarAdminYCargar();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Verificando credenciales de administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
            <p className="text-xs text-slate-500 mt-1">Evaluaciones neurológicas recibidas</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-xs transition-colors border border-red-200"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase font-semibold">
                <th className="p-4">Paciente</th>
                <th className="p-4">Identificación</th>
                <th className="p-4">Fecha de Envío</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {respuestas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">
                    No hay respuestas registradas todavía.
                  </td>
                </tr>
              ) : (
                respuestas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-800">
                      {item.data?.nombre || "Sin nombre"}
                    </td>
                    <td className="p-4 text-slate-600">
                      {item.data?.documento || "N/A"}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSeleccionada(item)}
                        className="px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {seleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                Detalle de Evaluación: {seleccionada.data?.nombre}
              </h3>
              <button
                onClick={() => setSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {Object.entries(seleccionada.data || {}).map(([key, value]) => (
                <div key={key} className="border-b border-slate-100 pb-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-medium text-slate-800 mt-0.5 block">
                    {value || "No especificado"}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setSeleccionada(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs"
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