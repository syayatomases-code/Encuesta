export const seccionesPreguntas = {
  seccion1: {
    titulo: "1. Datos Demográficos y Antecedentes Generales",
    descripcion: "Información básica de identificación y antecedentes médicos generales.",
    campos: {
      nombre: { label: "Nombre Completo del Paciente", tipo: "text", requerido: true, placeholder: "Ej. Carlos Martínez Pérez" },
      edad: { label: "Edad", tipo: "number", requerido: true, min: 1, max: 120, placeholder: "Ej. 45" },
      identificacion: { label: "Número de Identificación", tipo: "text", requerido: true, placeholder: "Cédula o Documento" },
      ocupacion: { label: "Ocupación Actual", tipo: "text", placeholder: "Ej. Ingeniero, Docente..." },
      traumatismo_craneo: { label: "¿Antecedentes de Golpes Fuertes en Cabeza?", tipo: "select", opciones: ["Sí", "No"] },
      lateralidad: { label: "Lateralidad (Mano dominante)", tipo: "select", opciones: ["Diestro", "Zurdo", "Ambidextro"] },
      hipertension: { label: "Hipertensión", tipo: "select", opciones: ["Sí", "No"] },
      diabetes: { label: "Diabetes", tipo: "select", opciones: ["Sí", "No"] },
      tiroides: { label: "Problemas Tiroides", tipo: "select", opciones: ["Ninguno", "Hipotiroidismo", "Hipertiroidismo"] },
      antecedentes_familiares: { label: "Antecedentes Familiares Neurológicos (Alzheimer, Parkinson, etc.)", tipo: "text", placeholder: "Ninguno" }
    }
  },
  seccion2: {
    titulo: "2. Síntomas y Trastornos Neurológicos Frecuentes",
    descripcion: "Evaluación de dolores, fatiga y alteraciones sensitivas o motoras.",
    campos: {
      dolor_cabeza: { label: "Frecuencia de dolores de cabeza o migrañas", tipo: "select", opciones: ["No presento", "Ocasional", "Frecuente", "Crónico"] },
      intensidad_dolor: { label: "Intensidad del Dolor (1 al 10)", tipo: "number", min: 1, max: 10 },
      tipo_dolor: { label: "Características del Dolor", tipo: "select", opciones: ["Opresivo", "Pulsátil", "Punziante", "Generalizado"] },
      frecuencia_fatiga: { label: "Nivel de Fatiga Mental / Cansancio Cognitivo (1 al 5)", tipo: "range", min: 1, max: 5 },
      problemas_sueno: { label: "Problemas graves de sueño", tipo: "select", opciones: ["Sí, frecuentemente", "No, duermo bien"] },
      debilidad_extremidades: { label: "Sensación de debilidad en extremidades", tipo: "select", opciones: ["Nunca", "Ocasionalmente", "Frecuentemente"] },
      vertigo: { label: "Mareos / Vértigo", tipo: "select", opciones: ["Raros", "Frecuentes", "Ninguno"] },
      problemas_equilibrio: { label: "Problemas Equilibrio", tipo: "select", opciones: ["Sí", "No"] },
      acufenos: { label: "Zumbidos Oídos (Acúfenos)", tipo: "select", opciones: ["Sí", "No"] }
    }
  },
  seccion3: {
    titulo: "3. Funciones Cognitivas, Memoria y Conducta",
    descripcion: "Evaluación de memoria, lenguaje y cambios conductuales.",
    campos: {
      memoria_corto_plazo: { label: "Dificultad memoria a corto plazo", tipo: "select", opciones: ["Ninguna", "Leve", "Moderada", "Severa"] },
      anomia: { label: "Problemas para encontrar palabras (Anomia)", tipo: "select", opciones: ["Sí", "No"] },
      concentracion: { label: "Dificultad de concentración diaria", tipo: "select", opciones: ["Nunca", "A veces", "Con frecuencia"] },
      cambios_humor: { label: "Cambios drásticos de humor / Irritabilidad", tipo: "select", opciones: ["Sí", "No"] },
      temblor_reposo: { label: "Temblor involuntario en reposo", tipo: "select", opciones: ["Sí", "No"] },
      dificultad_hablar: { label: "Dificultad para hablar o articular palabras", tipo: "select", opciones: ["Sí", "No"] }
    }
  },
  seccion4: {
    titulo: "4. Sistema Nervioso Autónomo y Observaciones",
    descripcion: "Últimos detalles clínicos y comentarios adicionales.",
    campos: {
      anosmia: { label: "Pérdida de Olfato (Anosmia)", tipo: "select", opciones: ["Sí", "No"] },
      problemas_deglucion: { label: "Problemas al Tragar (Deglución)", tipo: "select", opciones: ["Sí", "No"] },
      problemas_esfinteres: { label: "Control de Esfínteres", tipo: "select", opciones: ["Sí", "No"] },
      observaciones: { label: "Observaciones Adicionales o Comentarios", tipo: "textarea", placeholder: "Describa medicamentos, detalles o síntomas adicionales..." }
    }
  }
};