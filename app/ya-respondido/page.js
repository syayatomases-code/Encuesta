"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function YaRespondidoPage() {
  const router = useRouter();

  const handleSalir = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl mx-auto shadow-sm">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Evaluación ya registrada</h1>
        <p className="text-sm text-slate-500">
          Usted ya ha completado este formulario con anterioridad. El sistema solo permite un envío por usuario registrado.
        </p>
        <button
          onClick={handleSalir}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-sky-600/20 mt-4"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}