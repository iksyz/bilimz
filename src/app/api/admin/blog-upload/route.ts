import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const BUCKET = "blog-images";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFileName(name: string) {
  const lastDot = name.lastIndexOf(".");
  const base = (lastDot > 0 ? name.slice(0, lastDot) : name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const ext = (lastDot > 0 ? name.slice(lastDot + 1) : "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return ext ? `${base}.${ext}` : base;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: "File not found." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, message: "File exceeds 8 MB limit." }, { status: 413 });
    }

    const mime = file.type || "image/jpeg";
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        { ok: false, message: "Unsupported format. (jpeg/png/webp/gif)" },
        { status: 415 }
      );
    }

    const safeName = sanitizeFileName(file.name || `image.jpg`);
    const baseName = safeName.replace(/\.[^/.]+$/, "") || "image";
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `posts/${stamp}-${rand}-${baseName}.webp`;

    const arrayBuffer = await file.arrayBuffer();

    // Dynamically create the bucket if it does not exist
    try {
      await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_BYTES,
      });
    } catch (err) {
      // Ignore if bucket already exists
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { ok: false, message: "Image upload failed: " + uploadError.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An error occurred while processing the image." },
      { status: 500 }
    );
  }
}
