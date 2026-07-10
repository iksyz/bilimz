import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from("science_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, posts });
  } catch (error: any) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Could not load posts." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, content, category, image_url, image_prompt, customSlug } = body;

    if (!title || !summary || !content || !category || !image_url) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Generate clean slug
    const baseSlug = customSlug 
      ? slugify(customSlug, { lower: true, strict: true }) 
      : slugify(title, { lower: true, strict: true });
    
    let slug = baseSlug;
    let counter = 1;

    // Check slug uniqueness
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("science_posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { data: post, error } = await supabaseAdmin
      .from("science_posts")
      .insert([
        {
          slug,
          title,
          summary,
          category,
          content,
          image_url,
          image_prompt: image_prompt || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Could not create post." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, summary, content, category, image_url, image_prompt, customSlug } = body;

    if (!slug) {
      return NextResponse.json(
        { ok: false, message: "Original slug is required." },
        { status: 400 }
      );
    }

    // Retrieve original post
    const { data: currentPost, error: fetchError } = await supabaseAdmin
      .from("science_posts")
      .select("*")
      .eq("slug", slug)
      .single();

    if (fetchError || !currentPost) {
      return NextResponse.json(
        { ok: false, message: "Article not found." },
        { status: 404 }
      );
    }

    // Handle slug change
    let finalSlug = slug;
    if (customSlug && slugify(customSlug, { lower: true, strict: true }) !== slug) {
      const baseSlug = slugify(customSlug, { lower: true, strict: true });
      let tempSlug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existing } = await supabaseAdmin
          .from("science_posts")
          .select("id")
          .eq("slug", tempSlug)
          .maybeSingle();

        if (!existing) break;
        tempSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      finalSlug = tempSlug;
    }

    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from("science_posts")
      .update({
        slug: finalSlug,
        title: title || currentPost.title,
        summary: summary || currentPost.summary,
        content: content || currentPost.content,
        category: category || currentPost.category,
        image_url: image_url || currentPost.image_url,
        image_prompt: image_prompt !== undefined ? image_prompt : currentPost.image_prompt,
      })
      .eq("slug", slug)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ ok: true, post: updatedPost });
  } catch (error: any) {
    console.error("PATCH /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Could not update post." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { ok: false, message: "Slug is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("science_posts")
      .delete()
      .eq("slug", slug)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Article deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/posts error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Could not delete article." },
      { status: 500 }
    );
  }
}
