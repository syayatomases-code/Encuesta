export default function YaRespondidoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-3 font-bold shadow-md shadow-sky-600/20">
          ℹ
        </div>
        <h1 className="text-xl font-bold text-slate-800">Formulario ya completado</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Usted ya ha enviado su evaluación con anterioridad. No es necesario realizarla nuevamente.
        </p>
      </div>
    </div>
  );
}