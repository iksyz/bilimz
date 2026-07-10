import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log("No .env.local found. Make sure you have created one.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
  console.error("❌ Error: You need to set valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const samplePost = {
  slug: "neural-interfaces-future",
  title: "Neural Interfaces: The Dawn of Brain-Computer Symbiosis",
  summary: "Explore how direct brain-to-machine connections are moving from science fiction into clinical reality, potentially redefining human consciousness.",
  category: "Bio-Tech",
  content: `
**What if you could control digital environments using nothing but your thoughts? This is no longer speculative fiction—it is the bleeding edge of neurotechnology.**

### The Bridging of Two Worlds
For decades, the human-computer interface has been limited by physical biology: fingers typing on keyboards or eyes tracking cursors on screens. Now, high-density electrode arrays are bypassing physical limitations altogether. By tapping directly into the motor cortex, neural implants can translate electrical brain activity into binary commands in real-time.

### Clinical Miracles and Beyond
The immediate applications of this technology are profoundly humanitarian. Patients with severe spinal cord injuries or ALS have successfully used neural interfaces to move robotic limbs, type messages, and interact with the physical world. However, the ambitions of leading companies extend far beyond medical therapeutics. The ultimate goal is high-bandwidth, bidirectional communication—not just sending commands *out* of the brain, but downloading information directly *in*.

### The Ethical Frontier
The integration of human consciousness with artificial intelligence raises unprecedented ethical questions. If memory and cognition can be augmented digitally, where does the human end and the machine begin?

> **Did you know? Modern neural interfaces can read signals from individual neurons, processing data at speeds that allow paralyzed individuals to type up to 90 characters per minute using only their thoughts.**

**Practical Takeaway:** While consumer-grade brain implants are still years away, non-invasive EEG headsets are already available for meditation tracking and basic gaming. The era of neuro-computing has quietly begun.
  `,
  image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2071&auto=format&fit=crop",
  image_prompt: "A minimalist, cinematic rendering of glowing neural pathways connecting to a sleek, futuristic microchip. Central focal point. Emerald green and white palette."
};

async function seed() {
  console.log("Seeding sample content...");
  
  const { data, error } = await supabase
    .from('science_posts')
    .insert([samplePost])
    .select();

  if (error) {
    console.error("❌ Database Error:", error.message);
    process.exit(1);
  }

  console.log("✅ Sample content inserted successfully!");
  console.log(data);
}

seed();
