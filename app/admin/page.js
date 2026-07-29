"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [cargandoLogout, setCargandoLogout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarRespuestas();
  }, []);

  const cargarRespuestas = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("respuestas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener datos:", error);
    } else {
      setRespuestas(data || []);
    }
    setCargando(false);
  };

  const handleCerrarSesion = async () => {
    setCargandoLogout(true);
    localStorage.removeItem("cuestionario_en_curso");
    sessionStorage.clear();
    await supabase.auth.signOut();
    setCargandoLogout(false);
    router.replace("/login");
  };

  const respuestasFiltradas = respuestas.filter((item) => {
    const nombre = item.data?.nombre || "";
    return nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado con Botón de Cerrar Sesión */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Panel de Evaluaciones Clínicas</h1>
              <p className="text-xs text-slate-500">Centro de Neurología Especializada</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={cargarRespuestas}
              className="px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium rounded-lg text-sm border border-sky-200 transition-colors"
            >
              🔄 Actualizar
            </button>

            <button
              onClick={handleCerrarSesion}
              disabled={cargandoLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {cargandoLogout ? "Saliendo..." : "🚪 Cerrar Sesión"}
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="Buscar por nombre de paciente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </div>
          <div className="text-sm font-semibold text-slate-600">
            Total de pacientes: <span className="text-sky-600">{respuestasFiltradas.length}</span>
          </div>
        </div>

        {/* Lista / Tabla */}
        {cargando ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 font-medium">
            Cargando evaluaciones...
          </div>
        ) : respuestasFiltradas.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 font-medium">
            No hay registros almacenados.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Paciente</th>
                    <th className="p-4">Edad</th>
                    <th className="p-4">Dolor de Cabeza</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {respuestasFiltradas.map((item) => {
                    const datos = item.data || {};
                    const fecha = new Date(item.created_at).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-4 text-slate-500 text-xs">{fecha}</td>
                        <td className="p-4 font-semibold text-slate-800">
                          {datos.nombre || "Anónimo"}
                        </td>
                        <td className="p-4 text-slate-600">{datos.edad ? `${datos.edad} años` : "N/R"}</td>
                        <td className="p-4 text-slate-600">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                            {datos.dolor_cabeza || "No especificado"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setRespuestaSeleccionada(datos)}
                            className="px-3 py-1.5 bg-sky-600 text-white font-medium rounded-lg text-xs hover:bg-sky-700 transition-colors shadow-sm"
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Detalle */}
        {respuestaSeleccionada && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-800">Expediente de Evaluación</h3>
                <button
                  onClick={() => setRespuestaSeleccionada(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(respuestaSeleccionada).map(([clave, valor]) => (
                  <div key={clave} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">
                      {clave.replace(/_/g, " ")}
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      {Array.isArray(valor) ? valor.join(", ") : String(valor || "Sin respuesta")}
                    </p>
                  </div>
                ))}
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
    </div>
  );
}