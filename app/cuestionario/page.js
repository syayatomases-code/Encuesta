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
    let inactivityTimer;

    const verificarSesion = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.replace("/login");
        return;
      }

      // Validar si ya respondió anteriormente por seguridad
      const { data: respuestaExistente } = await supabase
        .from("respuestas")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (respuestaExistente) {
        router.replace("/ya-respondido");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    verificarSesion();

    // Lógica de inactividad (Ej: 15 minutos de inactividad cierra sesión y expulsa al login)
    const reiniciarTimerInactividad = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace("/login");
      }, 15 * 60 * 1000); // 15 minutos
    };

    const eventos = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    eventos.forEach((evento) => {
      window.addEventListener(evento, reiniciarTimerInactividad);
    });

    reiniciarTimerInactividad();

    return () => {
      clearTimeout(inactivityTimer);
      eventos.forEach((evento) => {
        window.removeEventListener(evento, reiniciarTimerInactividad);
      });
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm font-medium">Cargando sesión segura...</p>
      </div>
    );
  }

  return <EncuestaForm user={user} />;
}