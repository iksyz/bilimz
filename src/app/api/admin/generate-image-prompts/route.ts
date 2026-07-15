import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!content) {
      return NextResponse.json({ ok: false, message: "İçerik gerekli." }, { status: 400 });
    }

    const systemPrompt = `You are an expert Photo Editor for a modern, premium scientific digital magazine like WIRED or NY Times. 
Your job is to read the provided article content and generate highly engaging, MODERN, HYPER-REALISTIC photography prompts for Leonardo AI.

CRITICAL RULES FOR PROMPT GENERATION:
1. The images MUST look like real, high-end editorial documentary photographs (e.g., WIRED magazine, The Verge, NY Times Science).
2. DO NOT use styles that look like animations, digital paintings, 3D renders, or fantasy art. Everything must be grounded in modern photorealism.
3. Use professional photography terminology in your prompts: "shot on 35mm lens", "f/2.8 depth of field", "sharp focus", "dramatic rim lighting", "professional color grading", "macro photography" (if close up), "high-contrast".
4. Settings should be realistic: "modern minimalist laboratory", "clean clinical background", or "dark industrial setting".

OUTPUT FORMAT:
You MUST return ONLY a valid JSON object exactly matching this schema, without any markdown formatting or extra text:
{
  "image_prompt": "[Hyper-realistic, modern documentary photography 16:9 prompt for the main cover image representing the core theme]",
  "inline_image_prompts": [
    "[Hyper-realistic, modern documentary photography 16:9 prompt for a specific key moment or concept in the article]"
  ]
}

- Do NOT include markdown code blocks (like \`\`\`json). Just the raw JSON string.
- Provide 1 cover image prompt and between 1 to 3 inline image prompts.
- Prompts must be in English and highly descriptive (lighting, camera angle, subject, mood).`;

    const userPrompt = `Title: ${title || "Untitled"}\n\nContent:\n${content}\n\nGenerate the image prompts for this article based on the instructions.`;

    const msg = await createMessage({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const responseText = textBlock ? textBlock.text : "";

    // Safely extract JSON in case Claude still wraps it
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Claude response.");
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ ok: true, data: parsedData });
  } catch (error: any) {
    console.error("Generate image prompts error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
