// lib/preguntas.js
export const SECCIONES = [
  {
    id: "datos_personales",
    titulo: "1. Datos Demográficos y Antecedentes Generales",
    descripcion: "Información básica de identificación y antecedentes médicos generales.",
    preguntas: [
      { id: "nombre", label: "Nombre completo del paciente", type: "text", requerido: true },
      { id: "edad", label: "Edad", type: "number", requerido: true, min: 0, max: 120 },
      { id: "documento", label: "Número de identificación", type: "text", requerido: true },
      { id: "ocupacion", label: "Ocupación actual", type: "text", requerido: false },
      { id: "antecedentes_golpes", label: "¿Antecedentes de golpes fuertes en cabeza?", type: "select", options: ["Sí", "No"], requerido: true },
      { id: "lateralidad", label: "Lateralidad (mano dominante)", type: "select", options: ["Diestro", "Zurdo", "Ambidiestro"], requerido: true },
      { id: "hipertension", label: "Hipertensión", type: "select", options: ["Sí", "No"], requerido: true },
      { id: "diabetes", label: "Diabetes", type: "select", options: ["Sí", "No"], requerido: true },
    ],
  },
  {
    id: "sintomas_actuales",
    titulo: "2. Evaluación de Síntomas Actuales",
    descripcion: "Describa la frecuencia y características de los síntomas neurológicos.",
    preguntas: [
      { id: "cefalea_frecuencia", label: "Frecuencia de dolores de cabeza (cefaleas)", type: "select", options: ["Nunca", "Ocasional", "Frecuente", "Diaria"], requerido: true },
      { id: "mareos_vertigo", label: "¿Presenta episodios de mareos o vértigo?", type: "select", options: ["Sí", "No"], requerido: true },
      { id: "alteraciones_memoria", label: "Nota alteraciones recientes en la memoria", type: "select", options: ["Leve", "Moderada", "Severa", "Ninguna"], requerido: true },
      { id: "trastornos_sueno", label: "Trastornos del sueño", type: "select", options: ["Insomnio", "Somnolencia diurna", "Normal"], requerido: true },
    ],
  },
  {
    id: "habitos_estilo_vida",
    titulo: "3. Hábitos y Estilo de Vida",
    descripcion: "Factores externos que influyen en la salud neurológica.",
    preguntas: [
      { id: "fumador", label: "Hábito de fumar", type: "select", options: ["No fuma", "Exfumador", "Fumador activo"], requerido: true },
      { id: "alcohol", label: "Consumo de alcohol", type: "select", options: ["No consume", "Social", "Frecuente"], requerido: true },
      { id: "actividad_fisica", label: "Realiza actividad física", type: "select", options: ["Sedentario", "Ocasional", "Regular"], requerido: true },
    ],
  },
  {
    id: "observaciones_finales",
    titulo: "4. Observaciones y Medicamentos",
    descripcion: "Detalle cualquier otro medicamento o comentario relevante.",
    preguntas: [
      { id: "medicamentos_actuales", label: "Medicamentos que toma actualmente", type: "textarea", requerido: false },
      { id: "observaciones_medico", label: "Observaciones adicionales para el especialista", type: "textarea", requerido: false },
    ],
  },
];