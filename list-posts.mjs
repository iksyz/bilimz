import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from("science_posts")
    .select("id, title, slug, created_at, author")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  
  console.log("Found", data.length, "posts:");
  data.forEach((p, i) => {
    console.log(`[${i}] ID: ${p.id} | Slug: ${p.slug} | Title: ${p.title} | Created: ${p.created_at}`);
  });
}

main();
