import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";
import { slugify } from "@/lib/slugify";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CLAUDE_SYSTEM_PROMPT } from "@/lib/prompt-templates";

export const dynamic = "force-dynamic";

// Mock Leonardo function for prototype.
async function generateImage(prompt: string): Promise<string> {
  console.log("Generating image with prompt:", prompt);
  return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop";
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate via CRON_SECRET
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Select a random topic
    const topics = [
      "The potential of Neuralink in treating neurodegenerative diseases",
      "Dark Matter mapping and its implications for cosmology",
      "How circadian rhythm disruption accelerates cellular aging",
      "Quantum computing's threat to modern cryptography"
    ];
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

    // 3. Generate Content with Claude
    const msg = await createMessage({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      system: CLAUDE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a new scientific discovery piece about: ${selectedTopic}. Apply the ScienceOne.net editorial style.`
        }
      ]
    });

    const responseText = msg.content[0]?.text || "";
    
    // Parse the JSON response
    // Claude might wrap it in ```json blocks, so we clean it first
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Claude response.");
    }
    
    const articleData = JSON.parse(jsonMatch[0]);
    
    // 4. Generate Image via Leonardo.ai (Mocked)
    const imageUrl = await generateImage(articleData.image_prompt);
    
    // 5. Create Slug
    const slug = slugify(articleData.title);

    // 6. Save to Supabase
    const { data, error } = await supabaseAdmin
      .from("science_posts")
      .insert([
        {
          slug,
          title: articleData.title,
          summary: articleData.summary,
          category: articleData.category,
          content: articleData.content,
          image_prompt: articleData.image_prompt,
          image_url: imageUrl
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, post: data });
    
  } catch (error: any) {
    console.error("Error generating post:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
