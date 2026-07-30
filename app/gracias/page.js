"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GraciasPage() {
  const router = useRouter();

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-3 font-bold shadow-md shadow-emerald-500/20">
          ✓
        </div>
        <h1 className="text-xl font-bold text-slate-800">Evaluación Enviada</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Sus respuestas han sido registradas correctamente en el sistema. Su coordinador de SST revisará los resultados.
        </p>

        <button
          onClick={handleCerrarSesion}
          className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
        >
          Cerrar Sesión y Salir
        </button>
      </div>
    </div>
  );
}