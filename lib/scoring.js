// lib/scoring.js
// Calcula el nivel de alerta operacional (semáforo) combinando:
// 1. Las respuestas del cuestionario (percepción de riesgo, fatiga,
//    impulsividad, clima de seguridad, juicio situacional, hábitos)
// 2. Los resultados de las 3 Micro-Tasks cognitivas
//
// Es una regla transparente y ajustable, pensada para calibrarse
// con datos reales conforme se acumulen diagnósticos.

import { SECCIONES } from "./preguntas";

// --- 1. Puntaje de riesgo a partir de las respuestas del cuestionario ---
function calcularPuntajeRespuestas(respuestas) {
  if (!respuestas) return 0;

  let sumaPeso = 0;
  let sumaMaxima = 0;

  SECCIONES.forEach((seccion) => {
    seccion.preguntas.forEach((preg) => {
      if (!preg.peso || !preg.options) return;
      const valor = respuestas[preg.id];
      const indice = preg.options.indexOf(valor);
      const maxPeso = Math.max(...preg.peso);
      if (indice >= 0 && preg.peso[indice] !== undefined) {
        sumaPeso += preg.peso[indice];
      }
      sumaMaxima += maxPeso;
    });
  });

  // Umbrales de fatiga por horas de sueño (campos numéricos, no van en "peso")
  const horasSueno = Number(respuestas.fatiga_horas_sueno_ultima_noche);
  if (!Number.isNaN(horasSueno)) {
    sumaMaxima += 4;
    if (horasSueno < 5) sumaPeso += 4;
    else if (horasSueno < 6.5) sumaPeso += 2;
  }

  const diasLibres = Number(respuestas.fatiga_dias_libres_recientes);
  if (!Number.isNaN(diasLibres)) {
    sumaMaxima += 2;
    if (diasLibres === 0) sumaPeso += 2;
  }

  if (sumaMaxima === 0) return 0;
  // Devuelve un porcentaje de riesgo (0 a 100) según lo respondido
  return Math.round((sumaPeso / sumaMaxima) * 100);
}

// --- 2. Puntos de riesgo a partir de las Micro-Tasks cognitivas ---
function calcularPuntosMicroTests(microResultados) {
  if (!microResultados) return null;

  const { tiempoReaccion, atencionSostenida, controlImpulsividad } = microResultados;
  let puntos = 0;

  if (tiempoReaccion?.promedioMs > 450) puntos += 2;
  else if (tiempoReaccion?.promedioMs > 350) puntos += 1;
  if (tiempoReaccion?.salidasFalsas > 1) puntos += 1;

  const totalEstimulos = atencionSostenida?.totalEstimulos || 1;
  const tasaOmision = (atencionSostenida?.omisiones || 0) / totalEstimulos;
  const tasaFalsaAlarma = (atencionSostenida?.falsasAlarmas || 0) / totalEstimulos;
  if (tasaOmision > 0.2) puntos += 2;
  else if (tasaOmision > 0.1) puntos += 1;
  if (tasaFalsaAlarma > 0.15) puntos += 1;

  if (controlImpulsividad?.erroresNoGo >= 3) puntos += 2;
  else if (controlImpulsividad?.erroresNoGo >= 1) puntos += 1;
  if (controlImpulsividad?.omisionesGo > 2) puntos += 1;

  return puntos; // rango aproximado: 0 a 9
}

/**
 * Combina cuestionario + micro-tests en un solo nivel de alerta.
 * respuestas: objeto con las respuestas del cuestionario (sin incluir "microtests")
 * microResultados: objeto devuelto por MicroTests (o null si aún no se hicieron)
 */
export function calcularNivelAlerta(respuestas, microResultados) {
  const puntajeRespuestas = calcularPuntajeRespuestas(respuestas); // 0-100
  const puntosMicro = calcularPuntosMicroTests(microResultados); // 0-9 o null

  // Normalizamos ambas fuentes a una escala 0-10 y las promediamos
  // (si aún no hay micro-tests, el nivel se basa solo en el cuestionario)
  const escalaRespuestas = puntajeRespuestas / 10; // 0-10
  const escalaMicro = puntosMicro !== null ? puntosMicro : null;

  const puntajeFinal =
    escalaMicro !== null
      ? escalaRespuestas * 0.6 + escalaMicro * 0.4
      : escalaRespuestas;

  let nivel, etiqueta, recomendacion;

  if (puntajeFinal >= 6) {
    nivel = "rojo";
    etiqueta = "Alerta Alta";
    recomendacion =
      "Tanto tus respuestas como las pruebas cognitivas muestran señales importantes de fatiga, riesgo o dispersión. Antes de ingresar a zonas de alto riesgo, informa a tu supervisor y realiza una pausa activa de al menos 10 minutos.";
  } else if (puntajeFinal >= 3) {
    nivel = "amarillo";
    etiqueta = "Alerta Moderada";
    recomendacion =
      "Tus respuestas y/o tus pruebas cognitivas muestran cierta dispersión o factores de riesgo a vigilar. Realiza una pausa activa de 3 a 5 minutos, con ejercicios de oxigenación, antes de continuar con tareas críticas.";
  } else {
    nivel = "verde";
    etiqueta = "Alerta Normal";
    recomendacion =
      "Tus respuestas y tus indicadores cognitivos están dentro de rangos normales. Mantén las prácticas de autocuidado durante tu turno.";
  }

  if (!respuestas && !microResultados) {
    nivel = "gris";
    etiqueta = "Sin datos";
    recomendacion = "No se registraron respuestas ni resultados de pruebas cognitivas.";
  }

  return {
    nivel,
    etiqueta,
    recomendacion,
    detalle: {
      puntajeRespuestas, // 0-100
      puntosMicroTests: puntosMicro, // 0-9 o null
    },
  };
}