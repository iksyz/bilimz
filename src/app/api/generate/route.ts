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

    // 3. Search Web with Tavily
    let searchContext = "";
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (tavilyKey) {
      try {
        const searchRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: `latest scientific research news: ${selectedTopic}`,
            search_depth: "basic",
            include_answer: false,
            max_results: 3
          })
        });
        
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            searchContext = searchData.results
              .map((r: any) => `Source: ${r.url}\nContext: ${r.content}`)
              .join("\n\n");
          }
        }
      } catch (err) {
        console.error("Tavily search error:", err);
      }
    }

    // 4. Generate Content with Claude
    const promptContent = searchContext
      ? `Topic: ${selectedTopic}\n\nRecent scientific context from the web:\n${searchContext}\n\nGenerate a new scientific discovery piece based on this context. Apply the ScienceOne.net editorial style.`
      : `Generate a new scientific discovery piece about: ${selectedTopic}. Apply the ScienceOne.net editorial style.`;

    const msg = await createMessage({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: CLAUDE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: promptContent
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const responseText = textBlock ? textBlock.text : "";

    // Parse the JSON response
    // Claude might wrap it in ```json blocks, so we clean it first
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON match in response:", responseText);
      throw new Error("Failed to parse JSON from Claude response.");
    }
    
    let articleData;
    try {
      articleData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw Response:", responseText);
      throw new Error("Failed to parse JSON from Claude response. See server logs for details.");
    }
    
    // Check if this is a draft generation request (from Admin Panel)
    const url = new URL(request.url);
    const isDraft = url.searchParams.get("draft") === "true";

    if (isDraft) {
      // Just return the raw AI output for the Admin to preview and edit
      return NextResponse.json({ 
        success: true, 
        post: {
          title: articleData.title,
          summary: articleData.summary,
          category: articleData.category,
          content: articleData.content,
          image_prompt: articleData.image_prompt,
          image_url: "",
          slug: articleData.slug || slugify(articleData.title),
          inline_image_prompts: articleData.inline_image_prompts || []
        } 
      });
    }

    // 4. Generate Image via Leonardo.ai (Mocked)
    const imageUrl = await generateImage(articleData.image_prompt);
    
    // 5. Create Slug
    const slug = slugify(articleData.title);

    // Determine correct author
    let autoAuthor = "Emre Ipekyuz";
    if (articleData.category === "Cosmos") autoAuthor = "Siir Kaya";
    else if (articleData.category === "Bio-Tech") autoAuthor = "Wei Chen";
    else if (articleData.category === "Deep-Dive") autoAuthor = "Lukas Weber";

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
          image_url: imageUrl,
          author: autoAuthor
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
