import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    // Inicializamos el cliente aquí dentro para que corra solo en runtime (cuando se hace la petición)

    const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

    const body = await req.json();
    const { prompt, contexto } = body;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash", // O el modelo que estés usando
      messages: [
        {
          role: "system",
          content: "Eres un asistente clínico experto en analizar evaluaciones neurológicas de pacientes. Responde de forma clara, profesional y estructurada.",
        },
        {
          role: "user",
          content: `Contexto / Datos: ${JSON.stringify(contexto)}\n\nPregunta / Petición: ${prompt}`,
        },
      ],
    });

    const resultado = completion.choices[0].message.content;
    return NextResponse.json({ resultado });
  } catch (error) {
    console.error("Error en la API de IA:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud con IA" }, { status: 500 });
  }
}