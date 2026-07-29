"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function YaRespondidoPage() {
  const router = useRouter();

  useEffect(() => {
    // Cerrar sesión y limpiar rastros al llegar aquí
    const limpiarSesion = async () => {
      localStorage.removeItem("cuestionario_en_curso");
      sessionStorage.clear();
      await supabase.auth.signOut();
    };
    limpiarSesion();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Evaluación Ya Registrada</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Usted ya ha completado y enviado esta evaluación anteriormente. El sistema no permite múltiples envíos por usuario.
        </p>

        <button
          onClick={() => router.replace("/login")}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md"
        >
          Volver al Login
        </button>
      </div>
    </div>
  );
}