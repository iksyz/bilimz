-- Create the science_posts table
CREATE TABLE science_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE science_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all posts
CREATE POLICY "Allow public read access" 
  ON science_posts 
  FOR SELECT 
  USING (true);

-- Service Role (backend) inherently bypasses RLS for inserts/updates.
