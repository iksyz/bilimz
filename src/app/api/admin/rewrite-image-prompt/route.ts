import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ ok: false, message: "Prompt required." }, { status: 400 });
    }

    const systemPrompt = `You are an expert Photo Editor for a modern science digital magazine. 
The user is regenerating an image because they want a different visual outcome.
Given the original image prompt, create a COMPLETELY DIFFERENT alternative visual concept.
Change the camera angle, lighting, visual metaphor, and composition. 
CRITICAL RULE: The new prompt MUST describe a MODERN, HYPER-REALISTIC DOCUMENTARY PHOTOGRAPH. No animations, no 3D renders, no digital paintings. Keep it strictly photorealistic and modern.
Make it a cinematic, photorealistic 16:9 photography prompt for an AI image generator.

OUTPUT FORMAT:
Return ONLY the raw new prompt text. Do not wrap it in quotes. No introductory text.`;

    const msg = await createMessage({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Original Prompt: ${prompt}`
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const newPrompt = textBlock ? textBlock.text.trim() : prompt;

    return NextResponse.json({ ok: true, prompt: newPrompt });
  } catch (error: any) {
    console.error("Rewrite prompt error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to rewrite prompt." },
      { status: 500 }
    );
  }
}
