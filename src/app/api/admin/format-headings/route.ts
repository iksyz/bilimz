import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const SYSTEM_PROMPT = `You are an extremely strict formatting assistant. Your ONLY job is to find lines that look like headings in the provided text and format them using Markdown (## or ###).

CRITICAL RULES:
1. DO NOT change, add, or remove a single word from the paragraph text. The body content must remain EXACTLY the same.
2. DO NOT change the meaning, tone, or translate anything.
3. DO NOT add any conversational filler (like "Here is the text:" or "I have formatted the headings"). Output ONLY the formatted text.
4. Capitalize the headings properly to make them look professional (e.g. Title Case).
5. HIERARCHY: You MUST differentiate between main section headings and subheadings!
   - Use ## (H2) for main, broad section headings.
   - Use ### (H3) for smaller sub-points, lists, or minor sections under a main heading.
6. A line is likely a heading if it is relatively short, does not end with a period, and introduces the following paragraph.
7. Only return the raw text with the markdown headings applied.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ ok: false, message: "Text is required." }, { status: 400 });
    }

    const msg = await createMessage({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
      temperature: 0.1,
    });

    const formattedText = msg.content[0]?.text;

    if (!formattedText) {
      return NextResponse.json({ ok: false, message: "No content returned from AI." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, formattedText: formattedText.trim() });
  } catch (error: any) {
    console.error("Format headings error:", error);
    return NextResponse.json({ ok: false, message: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
