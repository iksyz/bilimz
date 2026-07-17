import { NextResponse } from "next/server";
import { createMessage } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, customSlug, image_prompt, inline_images, content, auditReport } = body;

    if (!title || !content || !auditReport) {
      return NextResponse.json({ ok: false, message: "Başlık, içerik ve denetim raporu gerekli." }, { status: 400 });
    }

    const prompt = `Sen uzman bir bilim kurgu yazarı ve Google Discover SEO uzmanısın. Aşağıda mevcut bir makale ve bu makaleye ait çok sert bir "Baş Editör Denetim Raporu" bulunuyor.
    
GÖREVİN:
Bu denetim raporundaki "Kritik Hatalar" ve "Öneriler" başlığı altındaki HER BİR MADDEYİ istisnasız olarak makaleye, başlığa, özete veya görsel istemlerine uygula!
Eğer rapor "tarih ekle" diyorsa metne tarih ekle. "Cümleyi böl" diyorsa böl. "Spekülatif olduğunu belirt" diyorsa belirt. Hiçbir eleştiriyi göz ardı etme.

ÖNEMLİ KURAL: Yazarın tonunu ve edebi akışını koruyacağım diye hataları düzeltmekten KORKMA. Rapordaki hataları düzeltmek ve önerileri uygulamak BİRİNCİ ÖNCELİĞİNDİR. Eski hatalı kelimeleri tamamen sil, yeni ve doğru cümleler/paragraflar yaz. İşin bittiğinde bu makale aynı denetmene girerse 10/10 alacak kusursuzlukta olmalıdır!

BİLİMSEL DOĞRULUK KURALI (Halisünasyon Yasaktır): Eksik verileri tamamlamak için ASLA kafandan spesifik yarıçap, mesafe, kütle, yıl veya istatistik uydurma! Eğer elinde teyitli bir veri yoksa (örn: tam km yarıçapı), yalan yanlış rakamlar eklemek yerine "bilim insanlarına göre son derece küçük" gibi doğru ama yuvarlak/genel tabirler kullan. Uydurma veriler E-E-A-T puanını düşürür.

GÖRSEL KURALI: Eğer denetmen görselleri eleştirdiyse veya "artist's impression" ekle dediyse, KESİNLİKLE yeni, fotogerçekçi ve istenen detayları barındıran 'image_prompt' ve 'inline_images' komutları yaz. Yazı içi görsel sayısı (inline_images array uzunluğu) sana verilen mevcut istem sayısıyla BİREBİR AYNI olmalıdır.

DİKKAT (ZORUNLU ADIM): Yanıtına İLK OLARAK <applied_fixes> etiketiyle başla. Bu etiketin içine, rapordaki "Kritik Hatalar" ve "Öneriler" listesindeki HER BİR maddeyi çözdüğünü kanıtlayan ÇOK KISA (maksimum 5 kelimelik) özetler yaz (Örn: "- 2011 tarihi eklendi", "- Jüpiter kütlesi düzeltildi"). Asla uzun açıklamalar (destan) yazma, çünkü token sınırına (limitine) takılıp metni yarım bırakıyorsun! Her madde için sadece 1 satır ve en fazla 5 kelime kullan.

Mevcut Başlık: ${title}
Mevcut Özet: ${summary}
Mevcut Slug: ${customSlug}
Mevcut Kapak Görseli İstemi: ${image_prompt}
Mevcut Yazı İçi Görsel İstemleri: ${JSON.stringify(inline_images)}
Mevcut İçerik:
${content}

Baş Editörün Raporu:
${auditReport}

ÇIKTI FORMATI:
Yanıtını KESİNLİKLE aşağıdaki XML etiketleri (tags) içinde ver. JSON kullanma! Bu, markdown içindeki tırnak işaretlerinin bozulmasını engelleyecek.

<applied_fixes>
- Rapordaki 1. madde için şu yapıldı...
- Rapordaki 2. madde için başlık değiştirildi...
</applied_fixes>

<title>Yeni ve Daha İlgi Çekici Başlık</title>

<summary>Daha merak uyandırıcı 150 karakterlik özet</summary>

<customSlug>kisa-seo-uyumlu-slug</customSlug>

<image_prompt>Çok daha gerçekçi ve çarpıcı kapak görseli istemi...</image_prompt>

<inline_images>
<image>Daha gerçekçi yazı içi görsel istemi 1</image>
<image>Daha gerçekçi yazı içi görsel istemi 2</image>
</inline_images>

<content>
TÜM HATALARI kökünden çözülmüş kusursuz markdown içerik metni...
</content>

<fixSummary>
### ✨ Neler Düzeltildi?
- Hatalı tarih düzeltildi.
- Özet ve başlık daha ilgi çekici hale getirildi.
</fixSummary>
Asla XML dışında bir yanıt verme.`;

    const msg = await createMessage({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: "You are an expert digital publisher. Return ONLY valid XML format using the requested tags.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const textBlock = msg.content.find((b: any) => b.type === "text");
    const responseText = textBlock ? textBlock.text.trim() : "";
    
    // Parse XML tags using regex
    const getTagContent = (text: string, tag: string) => {
      const regex = new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">", 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const getInlineImages = (text: string) => {
      const inlineBlock = getTagContent(text, 'inline_images');
      if (!inlineBlock) return [];
      const imgRegex = /<image>([\\s\\S]*?)<\/image>/gi;
      const images: string[] = [];
      let match;
      while ((match = imgRegex.exec(inlineBlock)) !== null) {
        images.push(match[1].trim());
      }
      return images;
    };

    let parsedData = null;
    try {
      parsedData = {
        title: getTagContent(responseText, 'title'),
        summary: getTagContent(responseText, 'summary'),
        customSlug: getTagContent(responseText, 'customSlug'),
        image_prompt: getTagContent(responseText, 'image_prompt'),
        inline_images: getInlineImages(responseText),
        content: getTagContent(responseText, 'content'),
        fixSummary: getTagContent(responseText, 'fixSummary')
      };

      if (!parsedData.title || !parsedData.content) {
        throw new Error("AI yanıtında gerekli XML etiketleri (title, content) eksik.");
      }
    } catch (e: any) {
      console.error("Failed to parse AI XML response", e, responseText);
      try {
        require('fs').writeFileSync(process.cwd() + '/scratch/ai-fail-log.txt', responseText || "No response text");
      } catch(err) {}
      return NextResponse.json({ ok: false, message: "AI geçerli bir format döndüremedi: " + e.message, rawResponse: responseText }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      title: parsedData.title,
      summary: parsedData.summary,
      customSlug: parsedData.customSlug,
      image_prompt: parsedData.image_prompt,
      inline_images: parsedData.inline_images,
      content: parsedData.content,
      fixSummary: parsedData.fixSummary
    });
  } catch (error: any) {
    console.error("Audit fix error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
