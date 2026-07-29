"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const usuarioLimpio = usuario.trim().toLowerCase();
    const emailFormateado = usuarioLimpio.includes("@")
      ? usuarioLimpio
      : `${usuarioLimpio}@neurologia.local`;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailFormateado,
      password: password,
    });

    if (authError) {
      setCargando(false);
      setError(`Error al ingresar: ${authError.message === "Invalid login credentials" ? "Usuario o clave incorrectos." : authError.message}`);
      return;
    }

    if (!authData.user) {
      setCargando(false);
      setError("No se pudo obtener la información del usuario.");
      return;
    }

    // Verificar el rol del usuario en la tabla perfiles
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (perfil?.rol === "admin") {
      setCargando(false);
      router.push("/admin");
      return;
    }

    // Verificar si el paciente ya respondió la encuesta previamente
    const { data: respuestaExistente } = await supabase
      .from("respuestas")
      .select("id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (respuestaExistente) {
      setCargando(false);
      router.replace("/ya-respondido");
      return;
    }

    setCargando(false);
    router.push("/cuestionario");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-3 font-bold">
            🧠
          </div>
          <h1 className="text-xl font-bold text-slate-800">Acceso a Evaluación</h1>
          <p className="text-xs text-sky-600 font-semibold tracking-wide uppercase mt-1">
            Centro de Neurología Especializada
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Usuario / Código de Paciente
            </label>
            <input
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Clave de Acceso
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </div>

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md disabled:opacity-50"
          >
            {cargando ? "Validando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-4 text-xs text-slate-400">
          Ingrese las credenciales suministradas por el especialista
        </div>
      </div>
    </div>
  );
}