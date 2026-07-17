import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, content, imageUrl, imagePrompt } = body;

    if (!title || !content) {
      return NextResponse.json({ ok: false, message: "Başlık ve içerik gerekli." }, { status: 400 });
    }

    const prompt = `Sen katı ve mükemmeliyetçi bir "Google Discover Baş Editörü" ve "E-E-A-T Bilimsel Doğrulayıcısı"sın. Aşağıdaki makaleyi okuyup bana detaylı bir "Denetim Raporu" sunmanı istiyorum. Raporu şık bir Markdown formatında (alt başlıklar, checklistler, kalın yazılar ve ikonlar/emojiler kullanarak) Türkçe olarak hazırla.

Denetlenecek Veriler:
Başlık: ${title}
Özet: ${summary}
Kapak Görseli İstemi / Alt Metni: ${imagePrompt || "Belirtilmedi"}
İçerik:
${content}

Lütfen raporunun en başına çok net, sert ve gerçekçi bir **GENEL DİSCOVER UYGUNLUK PUANI (10 üzerinden)** ekle (Örn: GENEL PUAN: 6.5/10). Lütfen acımasız ol, kolay kolay 9 veya 10 verme.

Ardından şu 4 ana kriteri çok sert bir şekilde eleştir ve her biri için detaylı puanlama yap (Her biri üzerinden /10):
1. Başlık ve Tıklanabilirlik (Discover Potansiyeli): Başlık Google Discover'da kullanıcının kaydırmayı durdurup tıklayacağı kadar merak uyandırıcı mı? Çok mu akademik, yoksa fazla mı clickbait?
2. Bilimsel Doğruluk ve E-E-A-T: İçerikteki bilimsel gerçekler, tarihler, teleskop/araç isimleri doğru mu? "Jüpiter" yerine "gaz devi" gibi yanlış tanımlamalar var mı? Kaynak gösterimi doğru mu?
3. Görsel Değerlendirmesi: Kapak görseli istemi/konsepti içeriğin ağırlığını yansıtıyor mu? (Sadece okuyucuya "Wow" dedirtecek türden olmalı).
4. Biçimlendirme ve Akıcılık: H2 ve H3 başlıkları kullanılmış mı? Paragraflar kısa ve okunaklı mı? Sona etkileşim (Call to Action) sorusu eklenmiş mi?

Son olarak, düzeltilmesi gereken kritik hatalar varsa "🛑 KRİTİK HATALAR" başlığı altında, önerilerin varsa "💡 ÖNERİLER" başlığı altında listele. (Not: Metni sen yeniden yazma, sadece eleştir ve puanla.)`;

    const msg = await createMessage({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: "Sen katı, mükemmeliyetçi ve acımasız bir Baş Editörsün. Raporu okuyucuyu (yazarı) eğitecek ve hatalarını net bir şekilde gösterecek şekilde Türkçe ve profesyonel bir tonda hazırla.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const auditText = textBlock ? textBlock.text : "";

    return NextResponse.json({ ok: true, auditText });
  } catch (error: any) {
    console.error("Audit content error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
