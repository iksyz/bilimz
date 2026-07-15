import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { ok: false, message: "CRON_SECRET environment variable is missing." },
        { status: 500 }
      );
    }

    const host = (await headers()).get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const generateUrl = `${protocol}://${host}/api/generate?draft=true`;

    const res = await fetch(generateUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Generation trigger failed: ${res.status} - ${errText}`);
      return NextResponse.json(
        { ok: false, message: `Generation failed: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, post: data.post });
  } catch (error: any) {
    console.error("Trigger generation error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
