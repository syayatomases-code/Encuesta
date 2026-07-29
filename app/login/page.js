"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;

    // 1. Verificar si es Administrador (puedes ajustar el correo o usar una tabla de roles)
    if (email === "admin@admin.com" || user.user_metadata?.role === "admin") {
      router.replace("/admin");
      return;
    }

    // 2. Si es paciente, verificar si ya respondió la encuesta en la tabla "respuestas"
    const { data: respuestaExistente, error: respError } = await supabase
      .from("respuestas")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (respError) {
      console.error("Error al verificar respuestas:", respError.message);
    }

    if (respuestaExistente) {
      router.replace("/ya-respondido");
    } else {
      router.replace("/cuestionario");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-3 shadow-md shadow-sky-600/20 font-bold">
            🔒
          </div>
          <h1 className="text-xl font-bold text-slate-900">Acceso a la Plataforma</h1>
          <p className="text-xs text-slate-500 mt-1">Ingresa tus credenciales institucionales</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
          >
            {loading ? "Verificando acceso..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}