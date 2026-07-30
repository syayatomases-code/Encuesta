import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt, contexto } = await request.json();

    const systemInstruction = `Eres un médico especialista en neuropsicología y analista de datos clínicos. 
    - Responde de forma completamente natural, directa y humana, como una conversación médica profesional.
    - ESTRICTAMENTE PROHIBIDO mencionar nombres de campos de código, variables o llaves de bases de datos (ej: nada de decir "campo *medicamentos_actuales*:" o similar). Interpreta la información y dilo de forma fluida (ej: si no toma nada, di simplemente "El paciente no toma ningún medicamento actualmente" o si toma algo, descríbelo de forma natural).
    - Si el contexto es una lista de múltiples pacientes, cruza los datos y responde de forma global a la solicitud.
    - NO utilices tablas de Markdown (evita barras verticales | o líneas con guiones ---) ni títulos con almohadillas (##). Utiliza únicamente texto plano, párrafos claros y viñetas sencillas con guiones (-) si es necesario.`;

    const fullPrompt = `
      Contexto clínico recibido:
      ${JSON.stringify(contexto, null, 2)}

      Pregunta o solicitud del médico/administrador:
      ${prompt}
    `;

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: fullPrompt }
      ],
      temperature: 0.3,
    });

    const resultado = completion.choices[0].message.content;

    return NextResponse.json({ resultado });
  } catch (error) {
    console.error("Error detallado en la API de IA (OpenRouter):", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud con OpenRouter." },
      { status: 500 }
    );
  }
}