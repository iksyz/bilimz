import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const LEO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ ok: false, message: "Prompt is required." }, { status: 400 });
    }

    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, message: "LEONARDO_API_KEY is missing." }, { status: 500 });
    }

    // 1. İşlemi Başlat
    // Kino XL Model ID
    const KINO_XL_MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628";
    
    // Prompt'u daha kaliteli ve sinematik hale getirmek için ekler yapıyoruz
    const enhancedPrompt = `${prompt}, cinematic lighting, hyper-detailed, photorealistic, high quality, masterpiece, 8k resolution, highly textured, science fiction aesthetic`;

    const createRes = await fetch(`${LEO_API_URL}/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        modelId: KINO_XL_MODEL_ID,
        width: 1024,
        height: 576, // 16:9
        num_images: 1,
        alchemy: true,
        highResolution: true
      }),
    });

    const createData = await createRes.json();
    
    if (!createRes.ok) {
      console.error("Leonardo API Error:", createData);
      return NextResponse.json({ ok: false, message: "Leonardo API request failed." }, { status: 500 });
    }

    const generationId = createData.sdGenerationJob?.generationId;

    if (!generationId) {
      return NextResponse.json({ ok: false, message: "Failed to get generation ID." }, { status: 500 });
    }

    // 2. Polling (İşlemin bitmesini bekle)
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 15; // 30 saniye maksimum bekleme (2s aralıklarla)

    while (!imageUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      const pollRes = await fetch(`${LEO_API_URL}/generations/${generationId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "accept": "application/json"
        }
      });

      if (!pollRes.ok) {
        console.error("Polling error", await pollRes.text());
        continue; // Hata alırsak denemeye devam edelim
      }

      const pollData = await pollRes.json();
      const status = pollData.generations_by_pk?.status;

      if (status === "COMPLETE") {
        const images = pollData.generations_by_pk?.generated_images;
        if (images && images.length > 0) {
          imageUrl = images[0].url;
        } else {
          return NextResponse.json({ ok: false, message: "Leonardo did not return any image URL." }, { status: 500 });
        }
      } else if (status === "FAILED") {
        return NextResponse.json({ ok: false, message: "Image generation failed on Leonardo side." }, { status: 500 });
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ ok: false, message: "Timeout waiting for Leonardo to finish." }, { status: 504 });
    }

    return NextResponse.json({ ok: true, url: imageUrl });

  } catch (error: any) {
    console.error("Leonardo Generate Image Error:", error);
    return NextResponse.json({ ok: false, message: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
