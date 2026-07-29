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

      {/* Listado dinámico de todas las preguntas y respuestas */}
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