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

    const prompt = `Rewrite the following scientific article content. Improve the narrative arc to clearly explain: 1. What is the event? 2. What is the issue/analogy? 3. What is the solution? 4. What are the takeaways? Keep it highly engaging, simple, and jargon-free like a premium editorial. Maintain markdown formatting. Do not include meta labels. 

IMPORTANT RULE (NO HALLUCINATIONS): DO NOT invent or hallucinate specific numbers, dates, radius (km), mass, or distances unless they are explicitly provided in the original text! If a specific statistic is missing, use general qualitative terms (e.g., "incredibly dense", "massive", "recently") instead of making up unverified numbers. Unverified numbers ruin E-E-A-T credibility.

Here is the current content to improve:\n\nTitle: ${title}\n\nContent:\n${currentContent || 'Draft a new engaging scientific piece for this title.'}`;

    const msg = await createMessage({
      model: "claude-sonnet-4-5",
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
