import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, currentContent } = body;

    if (!title) {
      return NextResponse.json({ ok: false, message: "Başlık gerekli." }, { status: 400 });
    }

    const prompt = `Rewrite the following scientific article content. Improve the narrative arc to clearly explain: 1. What is the event? 2. What is the issue/analogy? 3. What is the solution? 4. What are the takeaways? Keep it highly engaging, simple, and jargon-free like a premium editorial. Maintain markdown formatting. Do not include meta labels. Here is the current content to improve:\n\nTitle: ${title}\n\nContent:\n${currentContent || 'Draft a new engaging scientific piece for this title.'}`;

    const msg = await createMessage({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: "You are an expert digital publisher. Return ONLY the rewritten markdown content. No conversational intro or outro.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const rewrittenText = textBlock ? textBlock.text : "";

    return NextResponse.json({ ok: true, rewrittenText });
  } catch (error: any) {
    console.error("Rewrite content error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
