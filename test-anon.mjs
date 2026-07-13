import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAnon() {
  console.log("Testing with ANON key (Frontend simulation)...");
  const { data, error } = await supabaseAnon
    .from("science_posts")
    .select("*");

  if (error) {
    console.error("Error fetching with anon key:", error);
  } else {
    console.log(`Success! Found ${data.length} posts with anon key.`);
  }
}

testAnon();
