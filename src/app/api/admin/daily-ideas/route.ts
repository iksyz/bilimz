import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const systemPrompt = `You are an elite Editor-in-Chief for a viral science/technology digital magazine like WIRED or ScienceAlert.
Your job is to pitch exactly 10 highly engaging, Google Discover-optimized article ideas.
The ideas must answer the core questions: What is the event? What is the issue? What is the solution? What can be done?
Avoid boring Wikipedia-style topics. Focus on cutting-edge research, psychology, bio-tech, space, or daily life science that creates immediate curiosity.

OUTPUT FORMAT:
Return ONLY a valid JSON array of exactly 10 objects. NO markdown formatting, NO extra text.
[
  {
    "title": "A punchy, viral 60-character headline for Google Discover.",
    "reasoning": "A 1-2 sentence explanation of WHY this idea will get clicks and what the core story is.",
    "category": "Must be EXACTLY ONE of: Bio-Tech, Cosmos, Life-Science, Deep-Dive"
  }
]`;

    const msg = await createMessage({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Generate 10 fresh, highly viral Google Discover science/tech article ideas for today."
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const responseText = textBlock ? textBlock.text : "";

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Claude response.");
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ ok: true, data: parsedData });
  } catch (error: any) {
    console.error("Daily ideas error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
