"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GraciasPage() {
  const router = useRouter();

  useEffect(() => {
    // Cerrar sesión automáticamente al finalizar para asegurar que si intenta volver, pase por el login
    const cerrarSesionAlFinalizar = async () => {
      await supabase.auth.signOut();
    };
    cerrarSesionAlFinalizar();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl mx-auto shadow-sm">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900">¡Evaluación Completada!</h1>
        <p className="text-sm text-slate-500">
          Sus respuestas han sido guardadas exitosamente en el sistema médico. Agradecemos su tiempo y colaboración.
        </p>
        <button
          onClick={() => router.replace("/login")}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-slate-900/20 mt-4"
        >
          Finalizar y Salir
        </button>
      </div>
    </div>
  );
}