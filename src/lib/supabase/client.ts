import { createClient } from "@supabase/supabase-js";

// In a real application, these should be defined in .env.local
// e.g. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:9999";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  title: string;
  summary: string;
  category: "Bio-Tech" | "Cosmos" | "Life-Science" | "Deep-Dive";
  content: string;
  image_url: string;
  image_prompt: string;
  created_at: string;
};
