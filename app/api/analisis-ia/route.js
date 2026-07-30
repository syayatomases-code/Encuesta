import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Leemos la API Key de forma segura desde las variables de entorno del servidor
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar la API Key de OpenRouter en el servidor." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    const { prompt, contexto } = await request.json();

    const systemInstruction = `Eres un médico especialista en neuropsicología y analista de datos clínicos. 
    - Si el contexto es un solo paciente, analiza sus respuestas de forma individual, profesional y clínica.
    - Si el contexto es una lista de múltiples pacientes, cruza los datos y responde de forma global a la solicitud del administrador.
    IMPORTANTE: NO utilices tablas de Markdown (evita barras verticales | o líneas con guiones ---) ni títulos con almohadillas (##). Utiliza únicamente texto plano, párrafos claros y viñetas sencillas con guiones (-) para que el reporte sea perfectamente legible.`;

    const fullPrompt = `
      Contexto recibido (Paciente o Lista de Pacientes):
      ${JSON.stringify(contexto, null, 2)}

      Solicitud del administrador:
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