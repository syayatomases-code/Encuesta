"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GraciasPage() {
  const router = useRouter();

  useEffect(() => {
    // Al llegar a la página de gracias, limpiamos la sesión y los rastros de seguridad
    const cerrarSesionFinal = async () => {
      localStorage.removeItem("cuestionario_en_curso");
      sessionStorage.clear();
      await supabase.auth.signOut();
    };
    cerrarSesionFinal();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Evaluación Enviada!</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Tus respuestas han sido registradas exitosamente en el sistema del Centro de Neurología.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md"
        >
          Finalizar y Salir al Login
        </button>
      </div>
    </div>
  );
}