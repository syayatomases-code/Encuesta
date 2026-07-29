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
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Nombre del Paciente</span>
                  <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.nombre || "N/A"}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Edad</span>
                    <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.edad ? `${respuestaSeleccionada.edad} años` : "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Identificación</span>
                    <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.identificacion || "N/A"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Ocupación</span>
                  <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.ocupacion || "No especificada"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Dolor de Cabeza / Migrañas</span>
                  <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.dolor_cabeza || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Fatiga Mental (1 al 5)</span>
                  <p className="text-sm font-medium text-slate-800">Nivel {respuestaSeleccionada.frecuencia_fatiga || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Problemas de Sueño</span>
                  <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.problemas_sueno || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold uppercase text-sky-700 mb-1">Observaciones Adicionales</span>
                  <p className="text-sm font-medium text-slate-800">{respuestaSeleccionada.observaciones || "Ninguna"}</p>
                </div>
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