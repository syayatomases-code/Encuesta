"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { SECCIONES } from "@/lib/preguntas";
import { calcularNivelAlerta } from "@/lib/scoring";

export default function AdminPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("dashboard"); // "dashboard" o "trabajadores"

  // Estados para la IA Individual (en el modal)
  const [resumenIA, setResumenIA] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);
  const [chatHistorial, setChatHistorial] = useState([]);
  const [preguntaUsuario, setPreguntaUsuario] = useState("");

  // Referencias para el auto-scroll de los chats
  const chatEndRef = useRef(null);
  const chatGlobalEndRef = useRef(null);

  const scrollToBottomChat = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottomGlobal = () => {
    chatGlobalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottomChat();
    }, 50);
    return () => clearTimeout(timer);
  }, [chatHistorial, cargandoIA]);

  // Estados para la IA Global
  const [chatGlobalHistorial, setChatGlobalHistorial] = useState([]);
  const [promptGlobal, setPromptGlobal] = useState("");
  const [cargandoGlobal, setCargandoGlobal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottomGlobal();
    }, 50);
    return () => clearTimeout(timer);
  }, [chatGlobalHistorial, cargandoGlobal]);

  useEffect(() => {
    const verificarAdminYCargar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", session.user.id)
        .maybeSingle();

      if (perfil?.rol !== "admin") {
        router.replace("/cuestionario");
        return;
      }

      const { data, error } = await supabase
        .from("respuestas")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRespuestas(data);
      }
      setCargando(false);
    };

    verificarAdminYCargar();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const consultarIA = async (promptPersonalizado, contextoDatos) => {
    try {
      const res = await fetch("/api/analisis-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptPersonalizado,
          contexto: contextoDatos,
        }),
      });

      const data = await res.json();
      if (data.resultado) {
        return data.resultado;
      } else {
        return "No se pudo obtener una respuesta de la IA.";
      }
    } catch (err) {
      console.error(err);
      return "Error de conexión con el servidor de IA.";
    }
  };

  // Función para convertir **texto** en HTML de negrita de forma segura
  const formatearTextoConNegrillas = (texto) => {
    if (!texto) return null;
    
    const lineas = texto.split("\n");

    return lineas.map((linea, indexLine) => {
      const partes = linea.split(/\*\*(.*?)\*\*/g);

      return (
        <p key={indexLine} className="mb-2 last:mb-0 leading-relaxed">
          {partes.map((parte, index) => {
            if (index % 2 === 1) {
              return <strong key={index} className="font-bold text-indigo-950">{parte}</strong>;
            }
            return parte;
          })}
        </p>
      );
    });
  };

  const abrirDetalleConIA = async (item) => {
    setSeleccionada(item);
    setResumenIA("");
    setChatHistorial([]);
    setPreguntaUsuario("");
    
    setCargandoIA(true);
    const resumen = await consultarIA(
      "Genera un resumen del nivel de alerta y los factores de riesgo más relevantes de este diagnóstico de neuroseguridad.", 
      item.data
    );
    setResumenIA(resumen);
    setCargandoIA(false);
  };

  const enviarPreguntaChat = async (e) => {
    if (e) e.preventDefault();
    if (!preguntaUsuario.trim() || cargandoIA || !seleccionada) return;

    const nuevaPregunta = preguntaUsuario;
    setPreguntaUsuario("");
    setChatHistorial((prev) => [...prev, { remitente: "user", texto: nuevaPregunta }]);

    setCargandoIA(true);
    const respuestaIA = await consultarIA(nuevaPregunta, seleccionada.data);
    setCargandoIA(false);

    setChatHistorial((prev) => [...prev, { remitente: "ia", texto: respuestaIA }]);
  };

  const consultarGlobalIA = async (e) => {
    if (e) e.preventDefault();
    if (!promptGlobal.trim() || cargandoGlobal) return;

    const preguntaActual = promptGlobal;
    setPromptGlobal("");
    setChatGlobalHistorial((prev) => [...prev, { remitente: "user", texto: preguntaActual }]);

    setCargandoGlobal(true);
    const resultado = await consultarIA(preguntaActual, respuestas);
    setCargandoGlobal(false);

    setChatGlobalHistorial((prev) => [...prev, { remitente: "ia", texto: resultado }]);
  };

  // --- CÁLCULOS DE MÉTRICAS PARA EL DASHBOARD EMPRESARIAL ---
  const totalTrabajadores = respuestas.length;
  
  // Calcular edades promedio o grupos etarios si existe el campo edad o fecha de nacimiento
  const trabajadoresConEdad = respuestas.filter(item => item.data?.edad);
  const edadPromedio = trabajadoresConEdad.length > 0 
    ? Math.round(trabajadoresConEdad.reduce((acc, curr) => acc + Number(curr.data.edad), 0) / trabajadoresConEdad.length) 
    : "N/A";

  // Evaluaciones de los últimos 7 días
  const unaSemanaAtras = new Date();
  unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
  const evaluacionesRecientes = respuestas.filter(item => new Date(item.created_at) >= unaSemanaAtras).length;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Verificando credenciales de administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO CORPORATIVO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Enterprise v2.4
              </span>
              <h1 className="text-2xl font-bold text-slate-900">Centro de Mando · Neuroseguridad</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Plataforma centralizada de monitoreo y análisis neuronal</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex border border-slate-200 shadow-inner">
              <button
                onClick={() => setVistaActiva("dashboard")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  vistaActiva === "dashboard"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                📊 Dashboard BI
              </button>
              <button
                onClick={() => setVistaActiva("trabajadores")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  vistaActiva === "trabajadores"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                👥 Base de Trabajadores
              </button>
            </div>

            <button
              onClick={cerrarSesion}
              className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-2xl text-xs transition-colors border border-red-200 shadow-sm"
            >
              Salir
            </button>
          </div>
        </div>

        {/* VISTA 1: DASHBOARD EMPRESARIAL DINÁMICO */}
        {vistaActiva === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* TARJETAS DE KPIs (KEY PERFORMANCE INDICATORS) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Evaluaciones</span>
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-bold">📋</span>
                </div>
                <div className="mt-4">
                  <h2 className="text-3xl font-black text-slate-900">{totalTrabajadores}</h2>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">↑ Registros sincronizados en BD</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nuevos (7 Días)</span>
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold">⚡</span>
                </div>
                <div className="mt-4">
                  <h2 className="text-3xl font-black text-slate-900">{evaluacionesRecientes}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Actividad reciente semanal</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Edad Promedio</span>
                  <span className="p-2 bg-sky-50 text-sky-600 rounded-2xl text-sm font-bold">📊</span>
                </div>
                <div className="mt-4">
                  <h2 className="text-3xl font-black text-slate-900">{edadPromedio} <span className="text-sm font-normal text-slate-400">años</span></h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Demografía general</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estado del Sistema</span>
                  <span className="p-2 bg-purple-50 text-purple-600 rounded-2xl text-sm font-bold">🟢</span>
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-slate-900 mt-1">Operativo</h2>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">Supabase & IA Conectados</p>
                </div>
              </div>
            </div>

            {/* ASISTENTE GLOBAL DE TRABAJADORES (POTENCIADO PARA BI) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  IA Executive Insights
                </span>
                <h3 className="font-bold text-slate-800 text-lg">Asistente General de la Base de Datos</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Realiza consultas analíticas avanzadas cruzando información de todos los expedientes registrados.
              </p>

              {chatGlobalHistorial.length > 0 && (
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 shadow-inner">
                  {chatGlobalHistorial.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.remitente === "user" ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                        {msg.remitente === "user" ? "Tú (Director)" : "Motor IA Analítico"}
                      </span>
                      <div
                        className={`max-w-[85%] text-sm px-5 py-4 rounded-2xl shadow-sm leading-relaxed ${
                          msg.remitente === "user"
                            ? "bg-indigo-600 text-white rounded-br-xs font-medium"
                            : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs font-normal"
                        }`}
                      >
                        {msg.remitente === "ia" 
                          ? formatearTextoConNegrillas(msg.texto) 
                          : msg.texto}
                      </div>
                    </div>
                  ))}
                  {cargandoGlobal && (
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1">Motor IA Analítico</span>
                      <div className="text-sm text-indigo-600 font-medium animate-pulse px-5 py-4 bg-white rounded-2xl border border-slate-200 rounded-bl-xs shadow-sm">
                        Procesando analítica cruzada de la base de datos...
                      </div>
                    </div>
                  )}
                  <div ref={chatGlobalEndRef} />
                </div>
              )}

              <form onSubmit={consultarGlobalIA} className="flex gap-3">
                <input
                  type="text"
                  value={promptGlobal}
                  onChange={(e) => setPromptGlobal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      consultarGlobalIA();
                    }
                  }}
                  placeholder="Ej: ¿Cuáles son los factores de riesgo más recurrentes en todos los trabajadores registrados?"
                  className="flex-1 text-sm px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
                  disabled={cargandoGlobal}
                />
                <button
                  type="submit"
                  disabled={cargandoGlobal}
                  className="px-7 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {cargandoGlobal ? "Analizando..." : "Ejecutar Consulta"}
                </button>
              </form>
            </div>

            {/* TABLA RESUMEN DE ACTIVIDAD RECIENTE EN EL DASHBOARD */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Últimas Evaluaciones Ingresadas</h3>
                <button
                  onClick={() => setVistaActiva("trabajadores")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Ver registro completo →
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase font-semibold">
                      <th className="p-4">Trabajador</th>
                      <th className="p-4">Identificación</th>
                      <th className="p-4">Fecha de Envío</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {respuestas.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{item.data?.nombre || "Sin nombre"}</td>
                        <td className="p-4 text-slate-600">{item.data?.documento || "N/A"}</td>
                        <td className="p-4 text-slate-500 text-xs">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => abrirDetalleConIA(item)}
                            className="px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                          >
                            Inspeccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VISTA 2: BASE DE TRABAJADORES COMPLETA */}
        {vistaActiva === "trabajadores" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Directorio Completo de Trabajadores ({respuestas.length})</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase font-semibold">
                  <th className="p-4">Trabajador</th>
                  <th className="p-4">Identificación</th>
                  <th className="p-4">Fecha de Envío</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {respuestas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">
                      No hay respuestas registradas todavía.
                    </td>
                  </tr>
                ) : (
                  respuestas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-medium text-slate-800">
                        {item.data?.nombre || "Sin nombre"}
                      </td>
                      <td className="p-4 text-slate-600">
                        {item.data?.documento || "N/A"}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => abrirDetalleConIA(item)}
                          className="px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Ver Detalle & IA
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal de Detalle */}
      {seleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-800 text-xl">
                  Evaluación de: {seleccionada.data?.nombre || "Trabajador"}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">
                  Identificación: {seleccionada.data?.documento || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-2 rounded-xl hover:bg-slate-200/50 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">

              {/* 0. SEMÁFORO Y MICRO-TASKS COGNITIVAS */}
              {(() => {
                const mt = seleccionada.data?.microtests;
                const alerta = calcularNivelAlerta(seleccionada.data, mt);
                const coloresBadge = {
                  verde: "bg-emerald-100 text-emerald-800 border-emerald-300",
                  amarillo: "bg-amber-100 text-amber-800 border-amber-300",
                  rojo: "bg-red-100 text-red-800 border-red-300",
                  gris: "bg-slate-100 text-slate-600 border-slate-300",
                };
                const emojis = { verde: "🟢", amarillo: "🟡", rojo: "🔴", gris: "⚪" };
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                        Nivel de Alerta Operacional
                      </h4>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${coloresBadge[alerta.nivel]}`}>
                        {emojis[alerta.nivel]} {alerta.etiqueta}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{alerta.recomendacion}</p>
                    {mt ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase mb-1">Tiempo de Reacción</p>
                          <p className="text-slate-800">Promedio: {mt.tiempoReaccion?.promedioMs ?? "-"} ms</p>
                          <p className="text-slate-800">Salidas en falso: {mt.tiempoReaccion?.salidasFalsas ?? "-"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase mb-1">Atención Sostenida</p>
                          <p className="text-slate-800">Aciertos: {mt.atencionSostenida?.aciertos ?? "-"} / {mt.atencionSostenida?.totalEstimulos ?? "-"}</p>
                          <p className="text-slate-800">Omisiones: {mt.atencionSostenida?.omisiones ?? "-"}</p>
                          <p className="text-slate-800">Falsas alarmas: {mt.atencionSostenida?.falsasAlarmas ?? "-"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase mb-1">Control de Impulsividad</p>
                          <p className="text-slate-800">Errores No-Go: {mt.controlImpulsividad?.erroresNoGo ?? "-"}</p>
                          <p className="text-slate-800">Omisiones Go: {mt.controlImpulsividad?.omisionesGo ?? "-"}</p>
                          <p className="text-slate-800">RT Go promedio: {mt.controlImpulsividad?.promedioRtGoMs ?? "-"} ms</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Este registro no tiene resultados de micro-tasks (respuesta anterior a la actualización).</p>
                    )}
                  </div>
                );
              })()}

              {/* 1. SECCIONES TRADICIONALES PRIMERO */}
              {SECCIONES.map((sec) => (
                <div key={sec.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-sky-600 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                    {sec.titulo}
                  </h4>
                  <div className="space-y-4">
                    {sec.preguntas.map((preg) => {
                      const respuestaTrabajador = seleccionada.data?.[preg.id];
                      return (
                        <div key={preg.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <span className="text-slate-500 font-medium">
                            {preg.label}:
                          </span>
                          <span className="font-semibold text-slate-900 bg-slate-50/80 p-3 rounded-xl border border-slate-100 shadow-sm">
                            {respuestaTrabajador !== undefined && respuestaTrabajador !== "" 
                              ? respuestaTrabajador 
                              : "No respondido / Opcional"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* 2. BLOQUE DE INTELIGENCIA ARTIFICIAL AL FINAL */}
              <div className="bg-indigo-50/60 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Asistente IA
                  </span>
                  <h4 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">
                    Nivel de Alerta y Recomendación Preventiva
                  </h4>
                </div>

                {cargandoIA && !resumenIA ? (
                  <div className="text-sm text-indigo-600 font-medium animate-pulse py-3">
                    Analizando respuestas del trabajador...
                  </div>
                ) : (
                  <div className="text-base text-slate-800 bg-white p-5 rounded-2xl border border-indigo-100 leading-relaxed mb-6 shadow-sm">
                    {formatearTextoConNegrillas(resumenIA || "Haz clic para generar un resumen.")}
                  </div>
                )}

                {/* Chat Estilo Messenger para el trabajador seleccionado */}
                <div className="pt-5 border-t border-indigo-200/60">
                  <p className="text-xs font-bold text-indigo-950 uppercase tracking-wide mb-3">
                    Chat con la IA sobre este trabajador:
                  </p>
                  
                  {chatHistorial.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-3 bg-white/70 p-4 rounded-2xl border border-indigo-100 shadow-inner">
                      {chatHistorial.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex flex-col ${msg.remitente === "user" ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                            {msg.remitente === "user" ? "Tú (Médico)" : "Asistente IA"}
                          </span>
                          <div
                            className={`max-w-[85%] text-sm px-4 py-3 rounded-2xl shadow-sm leading-relaxed ${
                              msg.remitente === "user"
                                ? "bg-indigo-600 text-white rounded-br-xs font-medium"
                                : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs font-normal"
                            }`}
                          >
                            {msg.remitente === "ia" 
                              ? formatearTextoConNegrillas(msg.texto) 
                              : msg.texto}
                          </div>
                        </div>
                      ))}
                      {cargandoIA && (
                        <div className="flex flex-col items-start">
                          <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1">Asistente IA</span>
                          <div className="text-sm text-indigo-600 font-medium animate-pulse px-4 py-3 bg-white rounded-2xl border border-slate-200 rounded-bl-xs shadow-sm">
                            El asistente está redactando la respuesta...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}

                  <form onSubmit={enviarPreguntaChat} className="flex gap-3">
                    <input
                      type="text"
                      value={preguntaUsuario}
                      onChange={(e) => setPreguntaUsuario(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          enviarPreguntaChat();
                        }
                      }}
                      placeholder="Escribe una pregunta sobre el trabajador (ej: ¿Qué recomendación preventiva sugieres?)..."
                      className="flex-1 text-sm px-4 py-3.5 rounded-2xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
                      disabled={cargandoIA}
                    />
                    <button
                      type="submit"
                      disabled={cargandoIA}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm transition-colors shadow-md disabled:opacity-50"
                    >
                      {cargandoIA ? "Enviando..." : "Enviar"}
                    </button>
                  </form>
                </div>
              </div>

            </div>

            <div className="p-5 border-t border-slate-100 bg-white text-right shadow-lg">
              <button
                onClick={() => setSeleccionada(null)}
                className="px-7 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl text-sm transition-colors shadow-md"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}