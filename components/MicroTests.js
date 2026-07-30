"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * MicroTests
 * Implementa las 3 Pruebas de Desempeño Cognitivo del modelo Brain Safety:
 * 1. Tiempo de reacción simple
 * 2. Atención sostenida / labilidad
 * 3. Control de impulsividad (Go / No-Go)
 *
 * Al finalizar las 3 pruebas, llama a onComplete(resultados) con:
 * {
 *   tiempoReaccion: { promedioMs, salidasFalsas, muestras: [] },
 *   atencionSostenida: { aciertos, omisiones, falsasAlarmas, totalEstimulos },
 *   controlImpulsividad: { aciertosGo, omisionesGo, erroresNoGo, promedioRtGoMs },
 * }
 */
export default function MicroTests({ onComplete }) {
  const [paso, setPaso] = useState(0); // 0=intro, 1=reaccion, 2=atencion, 3=impulsividad, 4=resumen
  const [resultados, setResultados] = useState({});

  const avanzar = (clave, data) => {
    setResultados((prev) => {
      const nuevo = { ...prev, [clave]: data };
      if (Object.keys(nuevo).length === 3) {
        setTimeout(() => onComplete(nuevo), 400);
        setPaso(4);
      }
      return nuevo;
    });
    if (Object.keys(resultados).length < 2) {
      setPaso((p) => p + 1);
    }
  };

  return (
    <div className="min-h-[420px] flex flex-col">
      {paso === 0 && (
        <IntroMicroTests onStart={() => setPaso(1)} />
      )}
      {paso === 1 && (
        <TestTiempoReaccion onFinish={(data) => avanzar("tiempoReaccion", data)} />
      )}
      {paso === 2 && (
        <TestAtencionSostenida onFinish={(data) => avanzar("atencionSostenida", data)} />
      )}
      {paso === 3 && (
        <TestControlImpulsividad onFinish={(data) => avanzar("controlImpulsividad", data)} />
      )}
      {paso === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <div className="text-3xl">✅</div>
          <p className="text-sm font-semibold text-slate-700">Pruebas completadas. Calculando tu nivel de alerta...</p>
        </div>
      )}
    </div>
  );
}

function IntroMicroTests({ onStart }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
      <div className="text-4xl">🧠</div>
      <h2 className="text-xl font-bold text-slate-800">Pruebas Cognitivas Rápidas</h2>
      <p className="text-sm text-slate-500 max-w-md">
        Vas a realizar 3 micro-pruebas de 30 a 60 segundos cada una. No hay respuestas
        correctas o incorrectas de conocimiento: solo miden tu tiempo de reacción, tu
        atención y tu capacidad de autocontrol en este momento.
      </p>
      <button
        onClick={onStart}
        className="mt-4 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-md"
      >
        Comenzar Pruebas →
      </button>
    </div>
  );
}

/* ============================================================
   PRUEBA 1: Tiempo de Reacción Simple
   El trabajador debe hacer clic apenas aparezca el estímulo verde.
   5 rondas. Si hace clic antes de tiempo, se registra salida en falso.
   ============================================================ */
function TestTiempoReaccion({ onFinish }) {
  const TOTAL_RONDAS = 5;
  const [ronda, setRonda] = useState(0);
  const [estado, setEstado] = useState("esperando"); // esperando | listo | resultado_ronda
  const [mensaje, setMensaje] = useState("Presiona \"Iniciar Ronda\" y espera la señal verde.");
  const inicioRef = useRef(null);
  const timeoutRef = useRef(null);
  const muestrasRef = useRef([]);
  const salidasFalsasRef = useRef(0);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const iniciarRonda = () => {
    setEstado("preparando");
    setMensaje("Espera la señal...");
    const delay = 1000 + Math.random() * 2500;
    timeoutRef.current = setTimeout(() => {
      inicioRef.current = performance.now();
      setEstado("listo");
      setMensaje("¡AHORA!");
    }, delay);
  };

  const handleClickArea = () => {
    if (estado === "preparando") {
      // salida en falso
      clearTimeout(timeoutRef.current);
      salidasFalsasRef.current += 1;
      setMensaje("Salida en falso. Espera al color verde.");
      setEstado("resultado_ronda");
      return;
    }
    if (estado === "listo") {
      const rt = Math.round(performance.now() - inicioRef.current);
      muestrasRef.current.push(rt);
      setMensaje(`Tiempo de reacción: ${rt} ms`);
      setEstado("resultado_ronda");
    }
  };

  const siguienteRonda = () => {
    if (ronda + 1 >= TOTAL_RONDAS) {
      const validas = muestrasRef.current;
      const promedio = validas.length
        ? Math.round(validas.reduce((a, b) => a + b, 0) / validas.length)
        : 999;
      onFinish({
        promedioMs: promedio,
        salidasFalsas: salidasFalsasRef.current,
        muestras: validas,
      });
      return;
    }
    setRonda((r) => r + 1);
    setEstado("esperando");
    setMensaje("Presiona \"Iniciar Ronda\" y espera la señal verde.");
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Prueba 1 de 3 · Tiempo de Reacción</div>
      <div className="text-xs text-slate-500 mb-4">Ronda {ronda + 1} de {TOTAL_RONDAS}</div>

      <div
        onClick={handleClickArea}
        className={`flex-1 rounded-xl border-2 flex items-center justify-center cursor-pointer select-none transition-colors min-h-[220px]
          ${estado === "listo" ? "bg-emerald-500 border-emerald-600" : "bg-slate-100 border-slate-200"}`}
      >
        <p className={`text-lg font-bold ${estado === "listo" ? "text-white" : "text-slate-500"}`}>
          {mensaje}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        {(estado === "esperando") && (
          <button onClick={iniciarRonda} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-md">
            Iniciar Ronda
          </button>
        )}
        {estado === "resultado_ronda" && (
          <button onClick={siguienteRonda} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-md">
            {ronda + 1 >= TOTAL_RONDAS ? "Continuar a la siguiente prueba →" : "Siguiente Ronda"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PRUEBA 2: Atención Sostenida
   Aparece una secuencia de letras. El trabajador debe hacer clic
   solo cuando aparezca la letra objetivo ("X"). Distractores: otras letras.
   ============================================================ */
function TestAtencionSostenida({ onFinish }) {
  const LETRA_OBJETIVO = "X";
  const LETRAS = ["A", "B", "E", "H", "K", "M", "O", "Q", "R", "X"];
  const TOTAL_ESTIMULOS = 20;
  const INTERVALO_MS = 900;

  const [indice, setIndice] = useState(-1);
  const [letraActual, setLetraActual] = useState(null);
  const [terminado, setTerminado] = useState(false);
  const secuenciaRef = useRef([]);
  const respondidoRef = useRef(false);
  const timerRef = useRef(null);
  const statsRef = useRef({ aciertos: 0, omisiones: 0, falsasAlarmas: 0 });

  const generarLetra = useCallback(() => {
    // ~30% probabilidad de que sea el objetivo
    if (Math.random() < 0.3) return LETRA_OBJETIVO;
    const distractores = LETRAS.filter((l) => l !== LETRA_OBJETIVO);
    return distractores[Math.floor(Math.random() * distractores.length)];
  }, []);

  useEffect(() => {
    let contador = 0;
    const avanzarEstimulo = () => {
      if (contador >= TOTAL_ESTIMULOS) {
        setTerminado(true);
        onFinish({
          aciertos: statsRef.current.aciertos,
          omisiones: statsRef.current.omisiones,
          falsasAlarmas: statsRef.current.falsasAlarmas,
          totalEstimulos: TOTAL_ESTIMULOS,
        });
        return;
      }

      // evaluar el estímulo anterior si no fue respondido y era objetivo -> omisión
      if (contador > 0) {
        const anterior = secuenciaRef.current[contador - 1];
        if (anterior === LETRA_OBJETIVO && !respondidoRef.current) {
          statsRef.current.omisiones += 1;
        }
      }

      const nuevaLetra = generarLetra();
      secuenciaRef.current[contador] = nuevaLetra;
      respondidoRef.current = false;
      setLetraActual(nuevaLetra);
      setIndice(contador);
      contador += 1;
      timerRef.current = setTimeout(avanzarEstimulo, INTERVALO_MS);
    };

    avanzarEstimulo();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResponder = () => {
    if (respondidoRef.current || terminado) return;
    respondidoRef.current = true;
    if (letraActual === LETRA_OBJETIVO) {
      statsRef.current.aciertos += 1;
    } else {
      statsRef.current.falsasAlarmas += 1;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Prueba 2 de 3 · Atención Sostenida</div>
      <p className="text-xs text-slate-500 mb-4">
        Haz clic en &quot;Responder&quot; solo cuando aparezca la letra <strong>{LETRA_OBJETIVO}</strong>. Ignora las demás letras.
      </p>

      <div className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px]">
        <span className="text-6xl font-black text-slate-700">{letraActual}</span>
      </div>

      <div className="mt-4 text-center text-xs text-slate-400">
        Estímulo {Math.min(indice + 1, TOTAL_ESTIMULOS)} de {TOTAL_ESTIMULOS}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleResponder}
          disabled={terminado}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm shadow-md disabled:opacity-40"
        >
          Responder
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PRUEBA 3: Control de Impulsividad (Go / No-Go)
   Círculos verdes = hacer clic (Go). Círculos rojos = NO hacer clic (No-Go).
   ============================================================ */
function TestControlImpulsividad({ onFinish }) {
  const TOTAL_ESTIMULOS = 18;
  const INTERVALO_MS = 850;
  const PROB_NOGO = 0.28;

  const [color, setColor] = useState(null); // "go" | "nogo"
  const [indice, setIndice] = useState(-1);
  const [terminado, setTerminado] = useState(false);
  const respondidoRef = useRef(false);
  const inicioEstimuloRef = useRef(null);
  const timerRef = useRef(null);
  const statsRef = useRef({ aciertosGo: 0, omisionesGo: 0, erroresNoGo: 0, tiemposGo: [] });

  useEffect(() => {
    let contador = 0;
    const avanzarEstimulo = () => {
      if (contador >= TOTAL_ESTIMULOS) {
        setTerminado(true);
        const tiempos = statsRef.current.tiemposGo;
        const promedioRtGoMs = tiempos.length
          ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
          : 999;
        onFinish({
          aciertosGo: statsRef.current.aciertosGo,
          omisionesGo: statsRef.current.omisionesGo,
          erroresNoGo: statsRef.current.erroresNoGo,
          promedioRtGoMs,
        });
        return;
      }

      // evaluar estímulo anterior si era "go" y no respondió -> omisión
      if (contador > 0 && color === "go" && !respondidoRef.current) {
        statsRef.current.omisionesGo += 1;
      }

      const esNoGo = Math.random() < PROB_NOGO;
      respondidoRef.current = false;
      inicioEstimuloRef.current = performance.now();
      setColor(esNoGo ? "nogo" : "go");
      setIndice(contador);
      contador += 1;
      timerRef.current = setTimeout(avanzarEstimulo, INTERVALO_MS);
    };

    avanzarEstimulo();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (respondidoRef.current || terminado) return;
    respondidoRef.current = true;
    if (color === "go") {
      const rt = Math.round(performance.now() - inicioEstimuloRef.current);
      statsRef.current.aciertosGo += 1;
      statsRef.current.tiemposGo.push(rt);
    } else if (color === "nogo") {
      statsRef.current.erroresNoGo += 1;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Prueba 3 de 3 · Control de Impulsividad</div>
      <p className="text-xs text-slate-500 mb-4">
        Haz clic en el círculo <strong className="text-emerald-600">VERDE</strong>. No hagas clic si aparece <strong className="text-red-600">ROJO</strong>.
      </p>

      <div className="flex-1 flex items-center justify-center min-h-[220px]">
        <button
          onClick={handleClick}
          disabled={terminado || !color}
          className={`w-40 h-40 rounded-full shadow-lg transition-colors
            ${color === "go" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
            ${color === "nogo" ? "bg-red-500" : ""}
            ${!color ? "bg-slate-200" : ""}`}
        />
      </div>

      <div className="mt-4 text-center text-xs text-slate-400">
        Estímulo {Math.min(indice + 1, TOTAL_ESTIMULOS)} de {TOTAL_ESTIMULOS}
      </div>
    </div>
  );
}