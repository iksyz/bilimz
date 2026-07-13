"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { 
  Atom, Plus, Search, Edit3, Trash2, ArrowLeft, 
  Sparkles, FileText, Image as ImageIcon, CheckCircle, 
  Loader2, AlertCircle, Save, FolderOpen, RefreshCw,
  Clock, BookOpen, Layers, Check, Square, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// Bilimsel kategoriler kurulumu
const CATEGORIES = [
  { slug: "Bio-Tech", name: "Bio-Tech", icon: "🧬", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  { slug: "Cosmos", name: "Cosmos", icon: "🌌", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
  { slug: "Life-Science", name: "Life-Science", icon: "🌿", color: "#14b8a6", bg: "rgba(20, 184, 166, 0.1)" },
  { slug: "Deep-Dive", name: "Deep-Dive", icon: "🔬", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }
];

type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  content: string;
  image_url: string;
  image_prompt?: string;
  created_at: string;
};

type Draft = {
  id: string;
  form: FormState;
  savedAt: string;
  label: string;
};

type FormState = {
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  image_prompt: string;
  tags: string;
  customSlug: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  summary: "",
  content: "",
  category: "Bio-Tech",
  image_url: "",
  image_prompt: "",
  tags: "",
  customSlug: "",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "drafts" | "articles">("overview");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  
  // Filtreleme & Seçim
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  // Yükleme Durumları
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [formatting, setFormatting] = useState(false);
  
  // Yapay Zeka Üretim Durumları
  const [generating, setGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  
  // Bildirimler
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Yerel taslaklar
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement | null>(null);

  const DRAFTS_KEY = "scienceone_admin_drafts";

  // --- İlk Kurulum & Veri Çekme ---
  useEffect(() => {
    void loadPosts();
    loadDrafts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.posts) {
        setPosts(data.posts);
      } else {
        showMsg(data.message || "Yazılar yüklenirken bir hata oluştu.", "error");
      }
    } catch (err) {
      console.error(err);
      showMsg("Veritabanı bağlantısı kurulamadı.", "error");
    } finally {
      setLoading(false);
    }
  }

  // --- Taslak İşlemleri ---
  function loadDrafts() {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      if (raw) {
        setDrafts(JSON.parse(raw) as Draft[]);
      }
    } catch (err) {
      console.error("Taslaklar tarayıcı hafızasından yüklenemedi:", err);
    }
  }

  function saveLocalDraft() {
    if (!form.title.trim() && !form.content.trim()) {
      showMsg("Boş taslak kaydedilemez.", "error");
      return;
    }

    const currentDrafts = [...drafts];
    const draftId = activeDraftId || editingSlug || `draft-${Date.now()}`;
    const newDraft: Draft = {
      id: draftId,
      form: { ...form },
      savedAt: new Date().toISOString(),
      label: form.title.trim() || "Başlıksız Taslak",
    };

    const idx = currentDrafts.findIndex((d) => d.id === draftId);
    if (idx >= 0) {
      currentDrafts[idx] = newDraft;
    } else {
      currentDrafts.unshift(newDraft);
    }

    localStorage.setItem(DRAFTS_KEY, JSON.stringify(currentDrafts));
    setDrafts(currentDrafts);
    setActiveDraftId(draftId);
    showMsg(`Taslak "${newDraft.label}" başarıyla yerel olarak kaydedildi.`, "success");
  }

  function loadDraft(draft: Draft) {
    setForm(draft.form);
    setEditingSlug(null);
    setActiveDraftId(draft.id);
    setActiveTab("editor");
    showMsg(`Taslak "${draft.label}" editöre yüklendi.`, "info");
  }

  function deleteDraft(id: string) {
    const nextDrafts = drafts.filter((d) => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(nextDrafts));
    setDrafts(nextDrafts);
    if (activeDraftId === id) setActiveDraftId(null);
    showMsg("Taslak silindi.", "success");
  }

  // --- Bildirim Mesajı Göster ---
  function showMsg(text: string, type: "success" | "error" | "info" = "info") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 6000);
  }

  // --- İstatistik Hesaplamaları ---
  const wordCount = useMemo(() => {
    if (!form.content) return 0;
    return form.content.trim().split(/\s+/).filter(Boolean).length;
  }, [form.content]);

  const readTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // --- Yazı Filtreleme ---
  const filteredPosts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return posts.filter((post) => {
      const matchCategory = categoryFilter === "all" || post.category === categoryFilter;
      if (!matchCategory) return false;

      if (!query) return true;
      const contentString = `${post.title} ${post.summary} ${post.slug} ${post.category}`.toLowerCase();
      return contentString.includes(query);
    });
  }, [posts, searchText, categoryFilter]);

  // --- Görsel WebP Dönüştürme ---
  function convertToWebP(file: File, quality = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
      if (file.type === "image/gif") {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const targetRatio = 16 / 9;
          const imgRatio = img.width / img.height;
          
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          let sourceX = 0;
          let sourceY = 0;

          // Enforce 16:9 aspect ratio
          if (imgRatio > targetRatio) {
            // Image is wider than 16:9, crop sides
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else if (imgRatio < targetRatio) {
            // Image is taller than 16:9, crop top/bottom
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          // Max dimensions for optimization (e.g., 1920x1080)
          let targetWidth = sourceWidth;
          let targetHeight = sourceHeight;
          const MAX_WIDTH = 1920;
          
          if (targetWidth > MAX_WIDTH) {
            targetWidth = MAX_WIDTH;
            targetHeight = Math.round(MAX_WIDTH / targetRatio);
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("2D Canvas bağlamı oluşturulamadı."));
            return;
          }
          
          ctx.drawImage(
            img, 
            sourceX, sourceY, sourceWidth, sourceHeight, 
            0, 0, targetWidth, targetHeight
          );
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas ile WebP dönüştürme başarısız oldu."));
                return;
              }
              const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const convertedFile = new File([blob], newName, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(convertedFile);
            },
            "image/webp",
            quality
          );
        };
        img.onerror = () => reject(new Error("Görsel yüklenemedi."));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Dosya okunamadı."));
      reader.readAsDataURL(file);
    });
  }

  // --- Görsel Yükleme ---
  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>, isInline = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isInline) setInlineUploading(true);
    else setUploading(true);

    showMsg("Görsel WebP formatına dönüştürülüyor...", "info");

    try {
      const webpFile = await convertToWebP(file);
      showMsg("WebP görseli Supabase'e yükleniyor...", "info");

      const formData = new FormData();
      formData.append("file", webpFile);

      const res = await fetch("/api/admin/blog-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.ok && data.url) {
        if (isInline) {
          insertImageAtCursor(data.url, webpFile.name.replace(/\.[^/.]+$/, ""));
          showMsg("Görsel metin içine eklendi.", "success");
        } else {
          setForm((prev) => ({ ...prev, image_url: data.url }));
          showMsg("Kapak görseli başarıyla yüklendi.", "success");
        }
      } else {
        showMsg(data.message || "Yükleme başarısız oldu.", "error");
      }
    } catch (err) {
      console.error(err);
      showMsg("Görsel işlenirken veya yüklenirken hata oluştu.", "error");
    } finally {
      setUploading(false);
      setInlineUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  function insertImageAtCursor(url: string, altText: string) {
    const md = `\n![${altText || "Görsel"}](${url})\n`;
    const textarea = contentRef.current;
    if (!textarea) {
      setForm((prev) => ({ ...prev, content: `${prev.content}${md}` }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = form.content;
    const nextText = currentText.substring(0, start) + md + currentText.substring(end);
    setForm((prev) => ({ ...prev, content: nextText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + md.length, start + md.length);
    }, 50);
  }

  // --- Yapay Zeka Araçları ---
  async function aiFormatHeadings() {
    if (!form.content.trim()) {
      showMsg("Lütfen önce içerik yazın.", "info");
      return;
    }

    setFormatting(true);
    showMsg("AI başlık yapısını düzenliyor...", "info");

    try {
      const res = await fetch("/api/admin/format-headings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.content }),
      });

      const data = await res.json();
      if (res.ok && data.ok && data.formattedText) {
        setForm((prev) => ({ ...prev, content: data.formattedText }));
        showMsg("Başlıklar başarıyla düzenlendi!", "success");
      } else {
        showMsg(data.message || "Başlıklar düzenlenemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      showMsg("AI başlık düzenleme işlemi başarısız.", "error");
    } finally {
      setFormatting(false);
    }
  }

  async function aiGeneratePost() {
    setGenerating(true);
    setGenerationLogs([]);
    setActiveTab("overview");

    const addLog = (text: string) => {
      const time = new Date().toLocaleTimeString();
      setGenerationLogs((prev) => [...prev, `[${time}] ${text}`]);
    };

    addLog("Güvenli bağlantı kimlik doğrulaması başlatılıyor...");
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      addLog("Gelişmekte olan güncel bir bilimsel konu seçiliyor...");
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      addLog("Claude-3.7-Sonnet makale yazım motoru tetikleniyor...");

      const res = await fetch("/api/admin/generate", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.ok && data.post) {
        addLog("Sinematik bilimsel kapak görseli üretiliyor...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        addLog(`Makale başarıyla üretildi: "${data.post.title}"`);
        addLog("Veritabanı senkronize ediliyor...");
        
        await loadPosts();
        showMsg(`AI Makalesi yayınlandı: ${data.post.title}`, "success");
      } else {
        addLog(`Hata: ${data.message || "AI üretim hattı başarısız."}`);
        showMsg(data.message || "AI makale üretimi başarısız oldu.", "error");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Hata: ${err.message || "Bağlantı kesildi."}`);
      showMsg("AI makale üretim işlemi başarısız oldu.", "error");
    } finally {
      setGenerating(false);
    }
  }

  // --- CRUD İşlemleri ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.summary || !form.content || !form.image_url) {
      showMsg("Lütfen tüm zorunlu alanları doldurun (kapak görseli dahil).", "error");
      return;
    }

    setSaving(true);
    const isEdit = Boolean(editingSlug);

    try {
      const res = await fetch("/api/posts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...form, slug: editingSlug } : form),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        showMsg(
          isEdit 
            ? `"${data.post.title}" başlıklı makale başarıyla güncellendi.`
            : `"${data.post.title}" başlıklı makale başarıyla yayınlandı.`,
          "success"
        );

        const draftToClean = activeDraftId || editingSlug;
        if (draftToClean) {
          const nextDrafts = drafts.filter((d) => d.id !== draftToClean);
          localStorage.setItem(DRAFTS_KEY, JSON.stringify(nextDrafts));
          setDrafts(nextDrafts);
        }

        setForm(INITIAL_FORM);
        setEditingSlug(null);
        setActiveDraftId(null);
        await loadPosts();
        setActiveTab("articles");
      } else {
        showMsg(data.message || "Kaydetme işlemi başarısız.", "error");
      }
    } catch (err) {
      console.error(err);
      showMsg("Makale kaydedilirken hata oluştu.", "error");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(post: Post) {
    setEditingSlug(post.slug);
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category,
      image_url: post.image_url,
      image_prompt: post.image_prompt || "",
      tags: "",
      customSlug: post.slug,
    });
    setActiveDraftId(post.slug);
    setActiveTab("editor");
    showMsg(`Düzenleniyor: ${post.title}`, "info");
  }

  async function removePost(slug: string) {
    if (!window.confirm("Bu makaleyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        showMsg("Makale başarıyla silindi.", "success");
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
        if (editingSlug === slug) {
          setForm(INITIAL_FORM);
          setEditingSlug(null);
          setActiveDraftId(null);
        }
      } else {
        showMsg(data.message || "Silme işlemi başarısız.", "error");
      }
    } catch (err) {
      console.error(err);
      showMsg("Makale silinirken hata oluştu.", "error");
    }
  }

  async function deleteSelected() {
    if (selectedSlugs.size === 0) return;
    if (!window.confirm(`Seçilen ${selectedSlugs.size} makaleyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    const slugs = Array.from(selectedSlugs);
    let successCount = 0;

    showMsg(`Toplu silme işlemi devam ediyor...`, "info");

    for (const slug of slugs) {
      try {
        const res = await fetch("/api/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          successCount++;
          setPosts((prev) => prev.filter((p) => p.slug !== slug));
        }
      } catch (err) {
        console.error("Toplu silme hatası:", err);
      }
    }

    setSelectedSlugs(new Set());
    showMsg(`${successCount} makale silindi.`, "success");
    await loadPosts();
  }

  // --- Toplu Seçim Yardımcıları ---
  function toggleSelectPost(slug: string) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAllSelection() {
    if (selectedSlugs.size === filteredPosts.length) {
      setSelectedSlugs(new Set());
    } else {
      setSelectedSlugs(new Set(filteredPosts.map((p) => p.slug)));
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Bildirim Çubuğu */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in duration-300 ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : message.type === "error" 
            ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
            : "bg-blue-500/10 border-blue-500/30 text-blue-400"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Admin Panel Başlığı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">İçerik Yönetim Paneli</h1>
          <p className="text-[#a7f3d0]/80 mt-1">ScienceOne makalelerini yazın, yapay zekayla üretin ve yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              setForm(INITIAL_FORM);
              setEditingSlug(null);
              setActiveDraftId(null);
              setActiveTab("editor");
            }}
            className="bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Yeni Makale Yaz
          </Button>
          <Button 
            variant="outline" 
            onClick={aiGeneratePost}
            disabled={generating}
            className="border-primary/30 hover:bg-primary/10 text-primary-foreground font-semibold flex items-center gap-1.5"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Oto AI Üretici
          </Button>
        </div>
      </div>

      {/* Sekme Seçenekleri */}
      <div className="flex border-b border-primary/10 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <Atom className="w-4 h-4" /> Genel Bakış & AI
        </button>
        <button
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "editor"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <Edit3 className="w-4 h-4" /> Editör {editingSlug && <span className="bg-primary/20 text-primary text-[11px] px-1.5 py-0.5 rounded ml-1">Güncelle</span>}
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "drafts"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" /> Yerel Taslaklar ({drafts.length})
        </button>
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === "articles"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" /> Yayınlanan Makaleler ({posts.length})
        </button>
      </div>

      {/* SEKME İÇERİĞİ: Genel Bakış */}
      {activeTab === "overview" && (
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-[#03251e] border-primary/20 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Toplam Makale</CardTitle>
                <CardDescription className="text-[#a7f3d0]/60">Veritabanındaki toplam makale sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-white">{posts.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#03251e] border-primary/20 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-500">Taslak Yöneticisi</CardTitle>
                <CardDescription className="text-[#a7f3d0]/60">Tarayıcıda kayıtlı yerel taslaklar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-amber-400">{drafts.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#03251e] border-primary/20 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-400">Claude AI Hattı</CardTitle>
                <CardDescription className="text-[#a7f3d0]/60">Otonom makale üretme servisi</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center pt-2">
                <span className="relative flex h-3.5 w-3.5 mr-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <span className="text-base font-semibold text-emerald-400">Aktif</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* AI Makale Üretici */}
            <Card className="md:col-span-2 bg-[#02221b] border-primary/20 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="w-5 h-5 text-primary" /> Yapay Zeka Otonom Makale Üreticisi
                </CardTitle>
                <CardDescription className="text-[#a7f3d0]/70">
                  Claude-3.7-Sonnet modelini kullanarak veritabanına otomatik olarak yüksek kaliteli bilimsel makaleler araştırın, tasarlayın ve kaydedin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={aiGeneratePost}
                  disabled={generating}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-6 text-base font-bold shadow-lg shadow-primary/25"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Bilimsel İçerik Sentezleniyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" /> Otonom AI Makale Üretimini Başlat
                    </>
                  )}
                </Button>

                {generationLogs.length > 0 && (
                  <div className="mt-4 rounded-xl border border-primary/10 bg-[#011410] p-4 font-mono text-xs text-[#a7f3d0]/90 space-y-1.5 h-64 overflow-y-auto shadow-inner">
                    <div className="text-primary font-bold border-b border-primary/10 pb-1.5 mb-2 flex items-center justify-between">
                      <span>AI Konsolu</span>
                      <span className="animate-pulse">● Canlı Akış</span>
                    </div>
                    {generationLogs.map((log, i) => (
                      <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">{log}</div>
                    ))}
                    {generating && (
                      <div className="flex items-center gap-1.5 text-primary/70 mt-2 font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Düşünüyor...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hızlı İpuçları */}
            <Card className="bg-[#02221b] border-primary/20 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Hızlı İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#a7f3d0]/80 space-y-4">
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">1</div>
                  <p>Tamamen otomatik makaleler üretmek için <strong>Otonom AI Üretici</strong>'yi kullanın. Görsel de otomatik tasarlanacaktır.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">2</div>
                  <p>Veya kendi makalenizi manuel yazmak için <strong>Editör</strong>'ü kullanın. Görseller yükleyip metne ekleyebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">3</div>
                  <p>Editördeki <strong>AI Başlık Düzenleyici</strong>'ye tıklayarak başlıkları otomatik olarak estetik markdown formatına getirin.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">4</div>
                  <p>Yayınlamadan önce sağ taraftaki <strong>Canlı Kart Önizlemesi</strong>'nden makale kartını kontrol edin.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* SEKME İÇERİĞİ: Editör */}
      {activeTab === "editor" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#02221b] border-primary/20 text-white shadow-2xl">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary" /> {editingSlug ? "Makale Detaylarını Düzenle" : "Yeni Bilimsel Makale Yaz"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="space-y-5">
                  
                  {/* Başlık */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-wider uppercase text-primary">Makale Başlığı</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Etkileyici, bilim odaklı bir başlık girin..."
                      className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  {/* Kategori & Slug */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-wider uppercase text-primary">Kategori</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug} className="bg-[#011410]">
                            {c.icon} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-wider uppercase text-primary flex items-center justify-between">
                        Özel URL Linki (Slug) <span className="text-[10px] text-muted-foreground font-normal lowercase">(İsteğe Bağlı)</span>
                      </label>
                      <input
                        type="text"
                        value={form.customSlug}
                        onChange={(e) => setForm((prev) => ({ ...prev, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") }))}
                        placeholder="Örn: kuantum-bilgisayarlar-ve-simbiyoz"
                        className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm font-mono text-[#a7f3d0] placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {/* Özet */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-wider uppercase text-primary">Özet / Kısa Açıklama</label>
                    <textarea
                      required
                      rows={2}
                      maxLength={200}
                      value={form.summary}
                      onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                      placeholder="Ana sayfada ziyaretçileri çekmek için 150-200 karakterlik kısa bir özet yazın..."
                      className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-y"
                    />
                  </div>

                  {/* Markdown Editörü */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold tracking-wider uppercase text-primary">Makale İçeriği (Markdown)</label>
                      <div className="flex gap-1.5">
                        
                        {/* Görsel Ekle */}
                        <label className="bg-[#011410] hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-xs text-white font-semibold cursor-pointer flex items-center gap-1 transition-all">
                          <input 
                            ref={inlineFileInputRef}
                            type="file"
                            accept="image/*"
                            disabled={inlineUploading}
                            onChange={(e) => void uploadImage(e, true)}
                            className="hidden"
                          />
                          {inlineUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                          Yazı İçine Görsel Ekle
                        </label>

                        {/* AI Düzenle */}
                        <button
                          type="button"
                          disabled={formatting}
                          onClick={aiFormatHeadings}
                          className="bg-[#011410] hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-xs text-white font-semibold flex items-center gap-1 transition-all"
                        >
                          {formatting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          AI Başlık Düzenleyici
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        ref={contentRef}
                        required
                        rows={14}
                        value={form.content}
                        onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder="Bilimsel analizinizi markdown formatında yazın. Ana başlıklar için ##, alt başlıklar için ### kullanın..."
                        className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white font-mono placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-y leading-relaxed"
                      />
                      
                      {/* Kelime & Okuma Süresi Sayacı */}
                      <div className="absolute bottom-3 right-3 bg-[#02221b]/80 border border-primary/10 rounded-md px-2.5 py-1 flex items-center gap-3 text-[11px] font-mono text-[#a7f3d0]/80 backdrop-blur-sm select-none">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-primary" /> {wordCount} kelime</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {readTime} dk okuma</span>
                      </div>
                    </div>
                  </div>

                  {/* Kapak Görseli */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-wider uppercase text-primary">Kapak Görseli URL Adresi</label>
                      <input
                        type="url"
                        required
                        value={form.image_url}
                        onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                        placeholder="Görsel linkini yapıştırın veya bilgisayardan yükleyin..."
                        className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="hidden md:block opacity-0">Dosya yükle</label>
                      <label className="w-full bg-[#011410] hover:bg-primary/10 border border-primary/20 border-dashed rounded-lg p-3 text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-primary/50">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          onChange={(e) => void uploadImage(e, false)}
                          className="hidden"
                        />
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                        {uploading ? "Görsel WebP yapılıyor..." : "Bilgisayardan Kapak Görseli Yükle"}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-wider uppercase text-primary">Görsel Üretim İstemi (Image Prompt) <span className="text-[10px] text-muted-foreground font-normal lowercase">(AI referansı için)</span></label>
                    <input
                      type="text"
                      value={form.image_prompt}
                      onChange={(e) => setForm((prev) => ({ ...prev, image_prompt: e.target.value }))}
                      placeholder="Örn: Işıldayan sinir yollarının minimalist çizimi, yeşil ve beyaz tonlar..."
                      className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  {/* Form Butonları */}
                  <div className="flex justify-between items-center pt-4 border-t border-primary/10 flex-wrap gap-3">
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        {editingSlug ? "Güncellemeyi Yayınla" : "Portala Yayınla"}
                      </Button>

                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={saveLocalDraft}
                        className="border-amber-500/30 hover:bg-amber-500/10 text-amber-400 font-bold flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" /> Taslağı Kaydet
                      </Button>
                    </div>

                    {editingSlug && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          setForm(INITIAL_FORM);
                          setEditingSlug(null);
                          setActiveDraftId(null);
                          showMsg("Düzenleme iptal edildi.", "info");
                        }}
                        className="text-muted-foreground hover:text-white"
                      >
                        İptal Et
                      </Button>
                    )}
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon: Canlı Kart Önizlemesi */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-primary mb-1">Canlı Kart Önizlemesi</h3>
            
            <div className="block group">
              <Card className="overflow-hidden border-primary/10 bg-[#02221b] text-white shadow-2xl flex flex-col h-full rounded-xl transition-all duration-300">
                
                {/* Görsel */}
                <div className="relative aspect-video w-full overflow-hidden bg-emerald-950">
                  {form.image_url ? (
                    <img 
                      src={form.image_url} 
                      alt={form.title || "Kapak Önizlemesi"} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-primary/40 p-4">
                      <ImageIcon className="w-10 h-10 mb-2 stroke-[1.5]" />
                      <span className="text-xs font-mono">Kapak görseli burada görünecektir</span>
                    </div>
                  )}
                  
                  {/* Kategori Badge */}
                  <div className="absolute top-4 right-4 bg-[#011a14]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold tracking-wide text-primary shadow-sm border border-primary/10">
                    {form.category}
                  </div>
                </div>

                {/* Başlık */}
                <CardHeader className="pt-6">
                  <div className="text-[11px] text-[#a7f3d0]/60 font-mono mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> {readTime} dk okuma &bull; {new Date().toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                  </div>
                  <CardTitle className="leading-tight text-xl text-white group-hover:text-primary transition-colors">
                    {form.title || "Başlıksız Keşif Başlığı"}
                  </CardTitle>
                </CardHeader>

                {/* Özet */}
                <CardContent className="flex-1 pb-6 text-sm text-[#a7f3d0]/80 leading-relaxed">
                  {form.summary || "Bu kısım ziyaretçinin ilgisini çekecek makale özetidir. Kısa bir paragraf yazın..."}
                </CardContent>

                {/* Buton */}
                <CardFooter className="pt-0 border-t border-primary/10 bg-primary/5 px-6 py-4 mt-auto">
                  <div className="w-full flex items-center justify-between rounded-lg font-semibold h-11 px-4 text-xs bg-primary/10 text-primary border border-primary/20">
                    Makaleyi Oku 
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </div>
                </CardFooter>

              </Card>
            </div>

            {/* Markdown Kılavuzu */}
            <Card className="bg-[#02221b] border-primary/20 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Markdown Kılavuzu</CardTitle>
              </CardHeader>
              <CardContent className="text-xs font-mono text-[#a7f3d0]/80 space-y-2.5">
                <div>
                  <span className="text-white font-bold">## Ana Başlık</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">H2 bölüm başlığı oluşturur</p>
                </div>
                <div>
                  <span className="text-white font-bold">### Alt Başlık</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">H3 alt maddesi oluşturur</p>
                </div>
                <div>
                  <span className="text-white font-bold">**Kalın Yazı**</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Yazıyı vurgulu/kalın yapar</p>
                </div>
                <div>
                  <span className="text-white font-bold">&gt; **Bunu biliyor muydunuz?** Metin</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Renkli alıntı/vurgu kutusu oluşturur</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* SEKME İÇERİĞİ: Yerel Taslaklar */}
      {activeTab === "drafts" && (
        <Card className="bg-[#02221b] border-primary/20 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> Kaydedilen Taslaklar
            </CardTitle>
            <CardDescription className="text-[#a7f3d0]/70">
              Taslaklar doğrudan tarayıcınızın yerel hafızasında saklanır. Yayınlamadan önce güvenle yazabileceğiniz bir alandır.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {drafts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-primary/10 rounded-xl bg-[#011410]">
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Kayıtlı Taslak Bulunmamaktadır</h3>
                <p className="text-sm text-muted-foreground mt-1">Editör sekmesinde makalenizi yazın ve "Taslağı Kaydet" butonuna basın.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="bg-[#011410] border-primary/10 text-white flex flex-col h-full shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          {draft.form.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(draft.savedAt).toLocaleString("tr-TR", { day: "numeric", month: "numeric", hour: "numeric", minute: "numeric" })}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold line-clamp-2 h-12 leading-tight">
                        {draft.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 text-xs text-[#a7f3d0]/70 leading-relaxed line-clamp-3">
                      {draft.form.summary || "Henüz bir özet yazılmamış."}
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-primary/5 flex items-center justify-end gap-2 bg-[#01120e]/50">
                      <Button
                        variant="outline"
                        onClick={() => loadDraft(draft)}
                        className="border-primary/20 hover:bg-primary/10 text-primary-foreground text-xs h-8"
                      >
                        Editöre Yükle
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteDraft(draft.id)}
                        className="border-rose-500/20 hover:bg-rose-500/15 text-rose-400 text-xs h-8"
                      >
                        Sil
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEKME İÇERİĞİ: Yayınlanan Makaleler Tablosu */}
      {activeTab === "articles" && (
        <Card className="bg-[#02221b] border-primary/20 text-white shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Yayınlanan Makaleler Kataloğu
                </CardTitle>
                <CardDescription className="text-[#a7f3d0]/70">
                  Sitede yayında olan makaleleri arayın, filtreleyin, düzenleyin veya silin.
                </CardDescription>
              </div>
              
              {/* Yenile */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadPosts}
                disabled={loading}
                className="border-primary/20 hover:bg-primary/10 text-white shrink-0 self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Tabloyu Yenile
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-2 space-y-4">
            
            {/* Arama ve Filtreleme */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Makaleleri başlığa, linke (slug) veya özete göre arayın..."
                  className="w-full bg-[#011410] border border-primary/20 rounded-lg p-3 pl-10 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#011410] border border-primary/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 md:w-48"
              >
                <option value="all">Tüm Kategoriler</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toplu İşlemler & Sayaç */}
            <div className="flex justify-between items-center border-b border-primary/10 pb-3 flex-wrap gap-2 text-xs">
              <div className="text-[#a7f3d0]/70">
                Toplam <span className="font-bold text-white">{posts.length}</span> makaleden <span className="font-bold text-white">{filteredPosts.length}</span> tanesi gösteriliyor
              </div>
              
              {filteredPosts.length > 0 && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleAllSelection}
                    className="text-primary hover:underline font-semibold flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
                  >
                    {selectedSlugs.size === filteredPosts.length ? <Square className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {selectedSlugs.size === filteredPosts.length ? "Seçimleri Kaldır" : "Tümünü Seç"}
                  </button>

                  {selectedSlugs.size > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={deleteSelected}
                      className="bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300 text-rose-400 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Seçilenleri Sil ({selectedSlugs.size})
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Tablo Liste Görünümü */}
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Supabase veritabanına bağlanılıyor...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-primary/10 rounded-xl bg-[#011410]">
                <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Katalog Boş</h3>
                <p className="text-sm text-muted-foreground mt-1">Listeye eklemek için bir makale yayınlayın.</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-[#011410] border border-primary/10 rounded-xl">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-base">Eşleşen Makale Bulunamadı</h3>
                <p className="text-xs text-muted-foreground mt-1">Arama kelimesini veya kategori filtresini değiştirmeyi deneyin.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredPosts.map((post) => (
                  <div 
                    key={post.slug} 
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      selectedSlugs.has(post.slug) 
                        ? "bg-[#023126] border-primary/40" 
                        : "bg-[#011410] border-primary/10 hover:border-primary/20"
                    }`}
                  >
                    
                    {/* Checkbox */}
                    <div className="pt-1.5">
                      <button
                        onClick={() => toggleSelectPost(post.slug)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          selectedSlugs.has(post.slug)
                            ? "bg-primary border-primary text-white"
                            : "border-primary/30 hover:border-primary/50 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Küçük Resim Önizlemesi */}
                    <div className="w-16 h-16 rounded-lg bg-emerald-950 overflow-hidden shrink-0 hidden sm:block">
                      <img 
                        src={post.image_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Makale Meta Detayları */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{
                          backgroundColor: CATEGORIES.find(c => c.slug === post.category)?.bg || 'rgba(16, 185, 129, 0.1)',
                          color: CATEGORIES.find(c => c.slug === post.category)?.color || '#10b981'
                        }}>
                          {post.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(post.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white truncate leading-tight">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                        /article/{post.slug}
                      </p>
                    </div>

                    {/* İşlem Butonları */}
                    <div className="flex items-center gap-1 bg-[#02221b]/40 rounded-lg p-1 border border-primary/5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(post)}
                        className="h-8 w-8 text-primary hover:text-white hover:bg-primary/20"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void removePost(post.slug)}
                        className="h-8 w-8 text-rose-400 hover:text-white hover:bg-rose-500/20"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>
      )}

    </div>
  );
}
