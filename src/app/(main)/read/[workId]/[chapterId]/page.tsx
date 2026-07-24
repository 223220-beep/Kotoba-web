"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useStore";
import { ArrowLeft, ChevronLeft, ChevronRight, Type, BookText, Monitor, Play, Pause, Square, Volume2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";
import { useTTS } from "@/lib/useTTS";

const FONT_OPTIONS = [
  { name: "Source Serif 4", value: "'Source Serif 4', Georgia, serif" },
  { name: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { name: "Lora", value: "'Lora', Georgia, serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
];

type ReadingMode = "scroll" | "page";
const PARAGRAPHS_PER_PAGE = 15;

export default function ReadingViewPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.workId as string;
  const chapterId = params.chapterId as string;
  const contentRef = useRef<HTMLDivElement>(null);
  const viewCounted = useRef(false);

  const { readingFontSize, setReadingFontSize, setSidebarCollapsed } = useUIStore();
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [fontFamily, setFontFamily] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("kotoba_font") : null) || FONT_OPTIONS[0].value);
  const [readingMode, setReadingMode] = useState<ReadingMode>(() => (typeof window !== "undefined" ? localStorage.getItem("kotoba_mode") as ReadingMode : null) || "scroll");
  const [currentPage, setCurrentPage] = useState(0);

  // View counting
  useEffect(() => {
    if (viewCounted.current || !chapterId) return;
    viewCounted.current = true;
    const key = `kv_${chapterId}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    fetch(`/api/chapters/${chapterId}/view`, { method: "POST" }).catch(() => {});
  }, [chapterId]);

  const { data: work } = useQuery({
    queryKey: ["work", workId],
    queryFn: () => api.works.getById(workId),
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", workId],
    queryFn: () => api.chapters.getByWork(workId),
  });

  const { data: chapter } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => api.chapters.getById(chapterId),
    enabled: !!chapterId,
  });

  usePageTitle(chapter?.title);

  const currentChapterIndex = useMemo(() => {
    if (!chapters?.length) return 0;
    return Math.max(0, chapters.findIndex(c => c.id === chapterId));
  }, [chapters, chapterId]);

  const prevChapter = currentChapterIndex > 0 ? chapters?.[currentChapterIndex - 1] : null;
  const nextChapter = chapters && currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const paragraphs = useMemo(() => {
    return (chapter?.content || "").split('\n\n').filter(p => p.trim());
  }, [chapter?.content]);

  const totalPages = Math.max(1, Math.ceil(paragraphs.length / PARAGRAPHS_PER_PAGE));
  const pageParagraphs = paragraphs.slice(currentPage * PARAGRAPHS_PER_PAGE, (currentPage + 1) * PARAGRAPHS_PER_PAGE);

  // Scroll progress
  useEffect(() => {
    if (readingMode !== "scroll" || !contentRef.current) return;
    const savedPos = localStorage.getItem(`kp_${workId}_${chapterId}`);
    if (savedPos) requestAnimationFrame(() => window.scrollTo(0, parseInt(savedPos)));

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight > clientHeight) {
        localStorage.setItem(`kp_${workId}_${chapterId}`, String(scrollTop));
      }
    };
    const handleNearEnd = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - scrollTop - clientHeight < 800 && nextChapter) {
        setShowNextHint(true);
      } else {
        setShowNextHint(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleNearEnd);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleNearEnd);
    };
  }, [chapterId, workId, readingMode, nextChapter]);

  // Save page progress
  useEffect(() => {
    if (readingMode === "page") {
      localStorage.setItem(`kp_page_${workId}_${chapterId}`, String(currentPage));
    }
  }, [currentPage, chapterId, workId, readingMode]);

  // Restore page
  useEffect(() => {
    if (readingMode === "page") {
      const saved = localStorage.getItem(`kp_page_${workId}_${chapterId}`);
      if (saved) setCurrentPage(Math.min(parseInt(saved), totalPages - 1));
    }
  }, [readingMode, chapterId, workId, totalPages]);

  const [showNextHint, setShowNextHint] = useState(false);

  const { isPlaying, isPaused, activeParagraphIndex, activeCharIndex, rate, availableVoices, selectedVoiceURI, play, pause, resume, stop, setRate, setSelectedVoiceURI } = useTTS(paragraphs);

  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleManualScroll = () => {
      isUserScrolling.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 4000);
    };
    window.addEventListener('wheel', handleManualScroll, { passive: true });
    window.addEventListener('touchmove', handleManualScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleManualScroll);
      window.removeEventListener('touchmove', handleManualScroll);
    };
  }, []);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readingMode === "page") {
      play(currentPage * PARAGRAPHS_PER_PAGE);
    } else {
      let firstVisibleIdx = 0;
      for (let i = 0; i < paragraphs.length; i++) {
        const el = document.getElementById(`p-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 100 && rect.top < window.innerHeight) {
            firstVisibleIdx = i;
            break;
          }
        }
      }
      play(firstVisibleIdx);
    }
  };

  const renderParagraph = useCallback((text: string, globalIdx: number) => {
    if (activeParagraphIndex !== globalIdx || activeCharIndex < 0) {
      return text;
    }
    
    let endIdx = text.indexOf(' ', activeCharIndex);
    if (endIdx === -1) endIdx = text.length;

    const before = text.substring(0, activeCharIndex);
    const active = text.substring(activeCharIndex, endIdx);
    const after = text.substring(endIdx);

    return (
      <>
        {before}
        <span id="tts-active-word" className="bg-kotoba-gold/30 text-kotoba-gold rounded px-1 transition-colors">{active}</span>
        {after}
      </>
    );
  }, [activeParagraphIndex, activeCharIndex]);

  // Scroll active word into view
  useEffect(() => {
    if (activeCharIndex >= 0 && !isUserScrolling.current) {
      const el = document.getElementById("tts-active-word");
      if (el) {
        const rect = el.getBoundingClientRect();
        // Scroll if the word is in the bottom 30% or top 10% of the viewport
        if (rect.bottom > window.innerHeight * 0.7 || rect.top < window.innerHeight * 0.1) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      if (readingMode === "page" && activeParagraphIndex >= 0) {
        const newPage = Math.floor(activeParagraphIndex / PARAGRAPHS_PER_PAGE);
        if (newPage !== currentPage) {
          setCurrentPage(newPage);
        }
      }
    }
  }, [activeCharIndex, activeParagraphIndex, readingMode, currentPage]);

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 p-8 animate-fade-in">
        <div className="h-10 skeleton w-3/4 rounded-md mx-auto"></div>
        <div className="space-y-4 pt-12">
          {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-4 skeleton w-full rounded"></div>)}
        </div>
      </div>
    );
  }

  const toggleOverlay = () => {
    if (showControls) {
      setShowControls(false);
      return;
    }
    setOverlayVisible(v => !v);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 relative animate-fade-in min-h-screen">
      {/* Click backdrop to toggle overlay */}
      <div className="fixed inset-0 z-0" onClick={toggleOverlay} />

      {/* Sticky Header — hidden when overlay is off */}
      {overlayVisible && (
        <div
          className="relative flex items-center justify-between py-4 mb-8 px-4 border-b border-kotoba-border bg-kotoba-bg/95 backdrop-blur z-10"
          style={{ fontFamily }}
        >
          <Button variant="ghost" size="sm" onClick={() => router.push(`/works/${workId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir
          </Button>

          <div className="flex items-center gap-2">
            {readingMode === "page" && (
              <span className="text-xs text-kotoba-muted mr-2">
                {currentPage + 1} / {totalPages}
              </span>
            )}
            {readingMode === "scroll" && (
              <span className="text-xs text-kotoba-muted mr-2">{chapter.title}</span>
            )}

            {(!isPlaying && !isPaused) && (
              <Button variant="ghost" size="icon" onClick={handlePlayClick} title="Escuchar en voz alta">
                <Volume2 className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowControls(s => !s); }} title="Ajustes">
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showControls && overlayVisible && (
        <div className="fixed top-20 right-4 z-50 bg-kotoba-elevated border border-kotoba-border rounded-xl p-5 shadow-card w-72 animate-fade-up space-y-5" onClick={e => e.stopPropagation()}>
          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-xs text-kotoba-muted uppercase font-semibold tracking-wide">Tamaño</label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-8 w-8 text-sm"
                onClick={() => setReadingFontSize(Math.max(14, readingFontSize - 2))}>A−</Button>
              <input
                type="range"
                min="14"
                max="32"
                value={readingFontSize}
                onChange={(e) => setReadingFontSize(Number(e.target.value))}
                className="flex-1 accent-kotoba-gold"
              />
              <Button variant="outline" size="icon" className="h-8 w-8 text-sm"
                onClick={() => setReadingFontSize(Math.min(32, readingFontSize + 2))}>A+</Button>
            </div>
            <div className="text-center text-xs text-kotoba-muted">{readingFontSize}px</div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-xs text-kotoba-muted uppercase font-semibold tracking-wide">Tipografía</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-kotoba-bg border border-kotoba-border rounded-md px-3 py-2 text-sm text-kotoba-text focus:outline-none focus:ring-1 focus:ring-kotoba-gold"
              style={{ fontFamily }}
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Voice Selector */}
          {availableVoices.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-kotoba-muted uppercase font-semibold tracking-wide">Voz</label>
              <select
                value={selectedVoiceURI || ""}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full bg-kotoba-bg border border-kotoba-border rounded-md px-3 py-2 text-sm text-kotoba-text focus:outline-none focus:ring-1 focus:ring-kotoba-gold"
              >
                {availableVoices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reading Mode */}
          <div className="space-y-2">
            <label className="text-xs text-kotoba-muted uppercase font-semibold tracking-wide">Modo</label>
            <div className="flex gap-2">
              <Button
                variant={readingMode === "scroll" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setReadingMode("scroll")}
              >
                <Monitor className="h-4 w-4" /> Cascada
              </Button>
              <Button
                variant={readingMode === "page" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setReadingMode("page")}
              >
                <BookText className="h-4 w-4" /> Página
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Close settings on click outside */}
      {showControls && overlayVisible && (
        <div className="fixed inset-0 z-40" onClick={() => setShowControls(false)} />
      )}

      {/* Chapter Header */}
      <div className="text-center space-y-4 mb-16 px-4">
        <h2 className="font-display text-xl text-kotoba-gold">{work?.title || ""}</h2>
        <h1 className="font-display text-4xl font-bold text-kotoba-text">{chapter.title}</h1>
        {chapter.wordCount && (
          <p className="text-xs text-kotoba-muted">{chapter.wordCount} palabras</p>
        )}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="leading-relaxed text-kotoba-text/90 px-4 relative z-[1]"
        style={{ fontSize: `${readingFontSize}px`, fontFamily }}
        onClick={toggleOverlay}
      >
        {readingMode === "scroll" ? (
          paragraphs.map((p, idx) => <p key={idx} id={`p-${idx}`} className="mb-6">{renderParagraph(p, idx)}</p>)
        ) : (
          <div className="min-h-[60vh] flex flex-col justify-between">
            <div>
              {pageParagraphs.map((p, idx) => {
                const globalIdx = currentPage * PARAGRAPHS_PER_PAGE + idx;
                return <p key={globalIdx} id={`p-${globalIdx}`} className="mb-6">{renderParagraph(p, globalIdx)}</p>
              })}
            </div>
            {/* Page Navigation */}
            {overlayVisible && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-kotoba-border" onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <span className="text-xs text-kotoba-muted">{currentPage + 1} / {totalPages}</span>
                {currentPage < totalPages - 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  >
                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : nextChapter ? (
                  <Link href={`/read/${workId}/${nextChapter.id}`}>
                    <Button variant="default" size="sm">
                      Siguiente Capítulo <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll Mode: Bottom Navigation */}
      {readingMode === "scroll" && overlayVisible && (
        <>
          {/* Next chapter hint */}
          {showNextHint && nextChapter && (
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-kotoba-bg via-kotoba-bg/95 to-transparent pt-16 pb-6 px-4 flex justify-center z-30">
              <Link href={`/read/${workId}/${nextChapter.id}`}>
                <Button size="lg" className="shadow-card gap-2">
                  Siguiente: {nextChapter.title} <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mt-24 pt-8 border-t border-kotoba-border px-4">
            {prevChapter ? (
              <Link href={`/read/${workId}/${prevChapter.id}`}>
                <Button variant="ghost" className="flex flex-col items-start h-auto py-2">
                  <span className="text-xs text-kotoba-muted flex items-center mb-1">
                    <ChevronLeft className="h-3 w-3 mr-1" /> Anterior
                  </span>
                  <span className="text-sm text-kotoba-gold-light max-w-[150px] truncate">{prevChapter.title}</span>
                </Button>
              </Link>
            ) : <div />}

            <Link href={`/works/${workId}`}>
              <Button variant="outline">Índice</Button>
            </Link>

            {nextChapter ? (
              <Link href={`/read/${workId}/${nextChapter.id}`}>
                <Button variant="ghost" className="flex flex-col items-end h-auto py-2 text-right">
                  <span className="text-xs text-kotoba-muted flex items-center mb-1">
                    Siguiente <ChevronRight className="h-3 w-3 ml-1" />
                  </span>
                  <span className="text-sm text-kotoba-gold-light max-w-[150px] truncate">{nextChapter.title}</span>
                </Button>
              </Link>
            ) : <div />}
          </div>
        </>
      )}

      {/* Floating TTS Player */}
      {(isPlaying || isPaused) && (
        <div className="fixed bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-50 bg-kotoba-surface border border-kotoba-border rounded-full shadow-card-hover px-4 py-2 flex items-center gap-3 animate-fade-up" onClick={e => e.stopPropagation()}>
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-kotoba-muted hover:text-kotoba-text" onClick={stop}>
             <Square className="h-4 w-4" />
           </Button>
           <Button variant="default" size="icon" className="h-10 w-10 rounded-full bg-kotoba-gold hover:bg-kotoba-gold-light text-white shadow-gold-glow-sm" onClick={() => isPaused ? resume() : pause()}>
             {isPaused ? <Play className="h-5 w-5 ml-1" /> : <Pause className="h-5 w-5" />}
           </Button>
           <div className="flex items-center bg-kotoba-elevated rounded-full px-2 h-8 text-xs font-medium border border-kotoba-border">
             <button className="px-2 hover:text-kotoba-gold text-kotoba-muted" onClick={() => setRate(Math.max(0.5, rate - 0.25))}><Minus className="h-3 w-3" /></button>
             <span className="w-8 text-center text-kotoba-text">{rate}x</span>
             <button className="px-2 hover:text-kotoba-gold text-kotoba-muted" onClick={() => setRate(Math.min(2, rate + 0.25))}><Plus className="h-3 w-3" /></button>
           </div>
           {availableVoices.length > 0 && (
             <select
               value={selectedVoiceURI || ""}
               onChange={(e) => setSelectedVoiceURI(e.target.value)}
               className="bg-transparent text-xs font-medium text-kotoba-muted hover:text-kotoba-text focus:outline-none max-w-[90px] sm:max-w-[120px] truncate cursor-pointer pl-2 border-l border-kotoba-border ml-1"
               title="Cambiar voz"
             >
               {availableVoices.map(v => (
                 <option key={v.voiceURI} value={v.voiceURI} className="bg-kotoba-bg text-kotoba-text">{v.name}</option>
               ))}
             </select>
           )}
        </div>
      )}
    </div>
  );
}
