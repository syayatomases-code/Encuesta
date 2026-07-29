export const secciones = [
  {
    titulo: "Datos Clínicos y Generales",
    descripcion: "Información básica para el expediente de evaluación cognitiva.",
    preguntas: [
      { id: "nombre", tipo: "texto", pregunta: "Nombre completo del paciente", requerido: true },
      { id: "edad", tipo: "numero", pregunta: "Edad", requerido: true },
      {
        id: "genero",
        tipo: "radio",
        pregunta: "Género",
        opciones: ["Masculino", "Femenino", "Otro", "Prefiero no decir"],
        requerido: true,
      },
    ],
  },
  {
    titulo: "Estado Neuro-Cognitivo",
    descripcion: "Evaluación de síntomas frecuentes y nivel de concentración.",
    preguntas: [
      {
        id: "sintomas",
        tipo: "checkbox",
        pregunta: "¿Ha experimentado alguno de estos síntomas en el último mes?",
        opciones: [
          "Pérdida de memoria a corto plazo",
          "Dificultad para concentrarse",
          "Migrañas o cefaleas recurrentes",
          "Alteraciones en el sueño",
          "Mareos o vértigo",
        ],
        requerido: false,
      },
      {
        id: "frecuencia_fatiga",
        tipo: "escala",
        pregunta: "¿Con qué frecuencia siente fatiga mental al final del día? (1: Nunca - 5: Siempre)",
        min: 1,
        max: 5,
        requerido: true,
      },
    ],
  },
  {
    titulo: "Hábitos y Conclusiones",
    descripcion: "Factores de estilo de vida relacionados con la salud cerebral.",
    preguntas: [
      {
        id: "horas_sueno",
        tipo: "numero",
        pregunta: "Promedio de horas de sueño por noche",
        requerido: true,
      },
      {
        id: "observaciones",
        tipo: "texto_largo",
        pregunta: "Describa detalladamente cualquier otra observación respecto a su agilidad mental o cambios percibidos",
        requerido: false,
      },
    ],
  },
];