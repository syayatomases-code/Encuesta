"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EncuestaForm from "@/components/EncuestaForm";

export default function CuestionarioPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Advertencia nativa al intentar cerrar o recargar
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const verificarSeguridadYDuplicados = async () => {
      // 2. Control de F5 con localStorage
      const recargadoAntes = localStorage.getItem("cuestionario_en_curso");

      if (recargadoAntes) {
        localStorage.removeItem("cuestionario_en_curso");
        await supabase.auth.signOut();
        setLoading(false);
        router.replace("/login");
        return;
      }

      // 3. Validar sesión activa en Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        localStorage.removeItem("cuestionario_en_curso");
        setLoading(false);
        router.replace("/login");
        return;
      }

      // 4. VERIFICAR SI EL USUARIO YA RESPONDIó ANTERIORMENTE
      const { data: respuestasExistentes, error: queryError } = await supabase
        .from("respuestas")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (queryError) {
        console.error("Error al verificar duplicados:", queryError);
      }

      if (respuestasExistentes) {
        // Si ya tiene un registro, limpiar sesión y mandarlo a la página de aviso
        localStorage.removeItem("cuestionario_en_curso");
        await supabase.auth.signOut();
        setLoading(false);
        router.replace("/ya-respondido");
        return;
      }

      // 5. Si pasa todas las validaciones, permitimos el acceso
      localStorage.setItem("cuestionario_en_curso", "true");
      setUser(session.user);
      setLoading(false);
    };

    verificarSeguridadYDuplicados();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold">Verificando estado del usuario...</p>
      </div>
    );
  }

  return user ? <EncuestaForm user={user} /> : null;
}