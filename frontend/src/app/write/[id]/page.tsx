'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Printer, Sparkles } from 'lucide-react';
import { apiAddChapter, apiAddPage, apiGetBook, apiSavePage, apiRenameChapter, getTotalPages, getTotalWords } from '@/lib/api';
import { computePageMetrics } from '@/lib/pageMetrics';
import { Book, FONT_PRESETS, TRIM_SIZES } from '@/lib/types';
import BookSpread, { SpreadPage } from '@/components/BookSpread';
import Sidebar from '@/components/Sidebar';

export default function WritePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const bookRef = useRef<Book | null>(null);
  const [activeChapterId, setActiveChapterId] = useState('');
  const [activePageId, setActivePageId] = useState('');
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overflowLock = useRef(false);
  const spreadContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const load = useCallback(async () => {
    const loaded = await apiGetBook(params.id);
    setBook(loaded);
    bookRef.current = loaded;
    setActiveChapterId(loaded.chapters[0]?.id || '');
    setActivePageId(loaded.chapters[0]?.pages[0]?.id || '');
  }, [params.id]);

  useEffect(() => {
    load().catch(() => router.push('/login'));
  }, [load, router]);

  const persist = useCallback((nextBook: Book) => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setBook(nextBook);
      bookRef.current = nextBook;
      setSaved(true);
    }, 150);
  }, []);

  const updateLocalBook = useCallback((updater: (current: Book) => Book) => {
    const current = bookRef.current;
    if (!current) return;
    const nextBook = updater(current);
    bookRef.current = nextBook;
    setBook(nextBook);
    persist(nextBook);
  }, [persist]);

  const handlePageChange = useCallback((chapterId: string, pageId: string, content: string) => {
    updateLocalBook((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      chapters: current.chapters.map((chapter) => chapter.id === chapterId
        ? { ...chapter, pages: chapter.pages.map((page) => page.id === pageId ? { ...page, content } : page) }
        : chapter),
    }));
    void apiSavePage(params.id, chapterId, pageId, content);
  }, [params.id, updateLocalBook]);

  const handleOverflow = useCallback(async (chapterId: string, pageId: string, overflowText: string) => {
    if (overflowLock.current) return;
    overflowLock.current = true;
    try {
      const current = bookRef.current;
      if (!current) return;
      const chapter = current.chapters.find((c) => c.id === chapterId);
      if (!chapter) return;
      const pageIndex = chapter.pages.findIndex((p) => p.id === pageId);
      if (pageIndex < 0) return;

      let nextBook = current;
      if (!chapter.pages[pageIndex + 1]) {
        const added = await apiAddPage(current.id, chapterId, pageId, '');
        nextBook = {
          ...current,
          chapters: current.chapters.map((c) => c.id === chapterId
            ? { ...c, pages: [...c.pages, added] }
            : c),
          updatedAt: new Date().toISOString(),
        };
      }

      const updatedChapter = nextBook.chapters.find((c) => c.id === chapterId)!;
      const nextPage = updatedChapter.pages[pageIndex + 1];
      if (nextPage) {
        const merged = overflowText + (nextPage.content ? `\n\n${nextPage.content}` : '');
        nextBook = {
          ...nextBook,
          chapters: nextBook.chapters.map((c) => c.id === chapterId
            ? { ...c, pages: c.pages.map((page) => page.id === nextPage.id ? { ...page, content: merged } : page) }
            : c),
          updatedAt: new Date().toISOString(),
        };
        setActivePageId(nextPage.id);
        void apiSavePage(nextBook.id, chapterId, nextPage.id, merged);
      }

      bookRef.current = nextBook;
      setBook(nextBook);
      persist(nextBook);
    } finally {
      setTimeout(() => { overflowLock.current = false; }, 80);
    }
  }, [persist]);

  const handleAddChapter = useCallback(async () => {
    const current = bookRef.current;
    if (!current) return;
    const added = await apiAddChapter(current.id);
    const nextBook: Book = {
      ...current,
      chapters: [...current.chapters, added],
      updatedAt: new Date().toISOString(),
    };
    bookRef.current = nextBook;
    setBook(nextBook);
    persist(nextBook);
    setActiveChapterId(added.id);
    setActivePageId(added.pages[0]?.id || '');
  }, [persist]);

  const handleRenameChapter = useCallback(async (chapterId: string, title: string) => {
    const current = bookRef.current;
    if (!current) return;
    const nextBook: Book = {
      ...current,
      updatedAt: new Date().toISOString(),
      chapters: current.chapters.map((chapter) => chapter.id === chapterId ? { ...chapter, title } : chapter),
    };
    bookRef.current = nextBook;
    setBook(nextBook);
    persist(nextBook);
    void apiRenameChapter(current.id, chapterId, title);
  }, [persist]);

  const navigatePage = useCallback((direction: 'prev' | 'next') => {
    const current = bookRef.current;
    if (!current) return;
    const allPages = current.chapters.flatMap((chapter) => chapter.pages.map((page) => ({ chapterId: chapter.id, pageId: page.id })));
    const index = allPages.findIndex((entry) => entry.pageId === activePageId);
    if (direction === 'prev' && index > 0) {
      setActiveChapterId(allPages[index - 1].chapterId);
      setActivePageId(allPages[index - 1].pageId);
    }
    if (direction === 'next' && index < allPages.length - 1) {
      setActiveChapterId(allPages[index + 1].chapterId);
      setActivePageId(allPages[index + 1].pageId);
    }
  }, [activePageId]);

  const metrics = useMemo(() => {
    if (!book) return null;
    const trim = TRIM_SIZES.find((item) => item.id === book.trimSizeId) ?? TRIM_SIZES[0];
    const font = FONT_PRESETS.find((item) => item.id === book.fontPresetId) ?? FONT_PRESETS[0];
    return computePageMetrics(trim, font);
  }, [book]);

  // ── Scale the spread to fit the available container ────────────────────
  useEffect(() => {
    if (!metrics) return;
    const spineWidth = 12;
    const spreadW = metrics.pageWidthPx * 2 + spineWidth;
    const spreadH = metrics.pageHeightPx;

    function computeScale() {
      const el = spreadContainerRef.current;
      if (!el) return;
      const padH = 80; // top+bottom padding inside the scroll area
      const padW = 40;
      const availW = el.clientWidth  - padW;
      const availH = el.clientHeight - padH;
      const scaleW = availW / spreadW;
      const scaleH = availH / spreadH;
      setScale(Math.min(1, scaleW, scaleH)); // never upscale
    }

    computeScale();
    const ro = new ResizeObserver(computeScale);
    if (spreadContainerRef.current) ro.observe(spreadContainerRef.current);
    return () => ro.disconnect();
  }, [metrics]);

  if (!book || !metrics) {
    return <div className="flex min-h-screen items-center justify-center" style={{ background: '#ede5d0', color: 'rgba(44,31,20,0.45)' }}>Loading…</div>;
  }

  const allPages: (SpreadPage & { chapterId: string })[] = [];
  book.chapters.forEach((chapter, chapterIndex) => {
    chapter.pages.forEach((page, index) => {
      allPages.push({
        id: page.id,
        chapterId: chapter.id,
        content: page.content,
        pageNumber: page.pageNumber,
        totalPages: getTotalPages(book),
        chapterTitle: chapter.title,
        isFirstChapterPage: index === 0,
        chapterIndex,
      });
    });
  });

  const activeIndex = allPages.findIndex((entry) => entry.id === activePageId);
  const spreadIndex = Math.max(0, Math.floor(activeIndex / 2));
  const leftPage = allPages[spreadIndex * 2];
  const rightPage = allPages[spreadIndex * 2 + 1];

  return (
    <div className="flex h-screen overflow-hidden desk" style={{ background: '#080e1a' }}>
      <Sidebar
        book={book}
        activeChapterId={activeChapterId}
        activePageId={activePageId}
        onNavigate={(chapterId, pageId) => { setActiveChapterId(chapterId); setActivePageId(pageId); }}
        onAddChapter={handleAddChapter}
        onRenameChapter={handleRenameChapter}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 px-5 flex-shrink-0" style={{ background: 'rgba(8,14,26,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(201,180,122,0.12)', height: 42 }}>
          <button onClick={() => router.push('/')} className="btn-nav text-sm">
            <ArrowLeft size={14} /> Library
          </button>
          <div className="flex-1" />
          <span className="text-xs" style={{ color: 'rgba(201,180,122,0.5)' }}>{getTotalWords(book).toLocaleString()} words · {getTotalPages(book)} pages</span>
          <span className="text-xs" style={{ color: saved ? '#5fad74' : '#c9b87a' }}>{saved ? '✓ Saved' : 'Saving…'}</span>
          {/* Publish coming soon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,180,122,0.06)', border: '1px solid rgba(201,180,122,0.15)', borderRadius: 7, padding: '4px 10px', cursor: 'default' }} title="Publishing pipeline coming soon">
            <Sparkles size={12} style={{ color: '#c9b87a' }} />
            <span style={{ fontSize: 11, color: '#c9b87a', fontWeight: 600 }}>Publish</span>
            <span style={{ fontSize: 9, color: 'rgba(201,180,122,0.48)', background: 'rgba(201,180,122,0.10)', borderRadius: 3, padding: '1px 5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Soon</span>
          </div>
          <button onClick={() => window.open(`/print/${params.id}`, '_blank')} className="btn-nav" style={{ fontSize: 11, gap: 5 }}>
            <Printer size={12} /> Print
          </button>
        </div>

        <div ref={spreadContainerRef} className="flex-1 overflow-auto flex items-center justify-center" style={{ padding: '40px 20px', background: '#080e1a' }}>
          <div className="flex flex-col items-center gap-8">
            <div style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              // Reserve exact natural space so the parent doesn't over-scroll
              width:  metrics.pageWidthPx * 2 + 12,
              height: metrics.pageHeightPx,
              marginBottom: metrics.pageHeightPx * (scale - 1), // collapse gap when scaled down
            }}>
              <BookSpread
                leftPage={leftPage}
                rightPage={rightPage}
                metrics={metrics}
                activePageId={activePageId}
                bookTitle={book.title}
                onPageChange={handlePageChange}
                onOverflow={handleOverflow}
                onPageFocus={(pageId) => {
                  setActivePageId(pageId);
                  const found = allPages.find((page) => page.id === pageId);
                  if (found) setActiveChapterId(found.chapterId);
                }}
              />
            </div>

            <div className="flex items-center gap-5" style={{ marginTop: 16 }}>
              <button onClick={() => navigatePage('prev')} disabled={activeIndex <= 0} className="btn-nav disabled:opacity-20">
                <ChevronLeft size={14} /> Previous page
              </button>
              <span style={{ color: 'rgba(201,180,122,0.45)', fontSize: 12 }}>{spreadIndex * 2 + 1}–{Math.min(spreadIndex * 2 + 2, allPages.length)} of {allPages.length}</span>
              <button onClick={() => navigatePage('next')} disabled={activeIndex >= allPages.length - 1} className="btn-nav disabled:opacity-20">
                Next page <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
