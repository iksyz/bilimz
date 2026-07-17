import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ ok: false, message: "Makale içeriği gerekli." }, { status: 400 });
    }

    const prompt = `Sen uzman bir bilim editörü ve SEO uzmanısın. Görevin, aşağıdaki makale içeriğini okumak ve içerikte geçen 3 ila 5 adet yüksek değerli, spesifik bilimsel/teknik terimi bulmaktır (Örn: beyaz cüce, James Webb Uzay Teleskobu, nötron yıldızı, kuantum dolanıklığı, pulsarlar vb.).

Bulduğun bu terimleri, orijinal metni ASLA bozmadan ve cümlenin akışını KESİNLİKLE değiştirmeden, ilgili terimin üstüne tıklanabilir bir Markdown linki olarak ekle.
Kullanacağın linkler KESİNLİKLE Wikipedia (Türkçe veya İngilizce), NASA, Nature veya dengi global ve otoriter siteler olmalıdır. Hayali veya uydurma bir link ekleme.

Örnek Dönüşüm:
Öncesi: "Gökbilimciler yeni bir nötron yıldızı keşfetti."
Sonrası: "Gökbilimciler yeni bir [nötron yıldızı](https://tr.wikipedia.org/wiki/N%C3%B6tron_y%C4%B1ld%C4%B1z%C4%B1) keşfetti."

KURALLAR:
1. Sadece 3 ile 5 arası kelimeyi linkle. Her şeyi linkleme.
2. Linklediğin kelimelerin Wikipedia veya NASA url'sini doğru tahmin etmeye çalış (örn. https://en.wikipedia.org/wiki/Pulsar).
3. Makalenin İÇERİĞİNİ veya ÜSLUBUNU asla değiştirme. Sadece araya markdown link `[kelime](url)` ekle.

İşte makale içeriği:
${content}`;

    const msg = await createMessage({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: "You are an expert digital publisher. Return ONLY the modified markdown content. Do not include introductory text, conversational filler, or wrap it in a JSON block. Just output the raw markdown text.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const linkedText = textBlock ? textBlock.text.trim() : "";

    return NextResponse.json({ ok: true, linkedText });
  } catch (error: any) {
    console.error("Auto-link content error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
