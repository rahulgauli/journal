'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Sparkles } from 'lucide-react';
import { apiGetBook, countWords, getTotalWords, getTotalPages } from '@/lib/api';
import { Book, FONT_PRESETS, TRIM_SIZES } from '@/lib/types';

export default function PrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);

  const load = useCallback(async () => {
    const loaded = await apiGetBook(params.id);
    setBook(loaded);
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => router.push('/login'));
  }, [load, router]);

  if (!book) {
    return (
      <div style={{ minHeight: '100vh', background: '#080e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(200,210,225,0.35)', fontFamily: 'Georgia, serif', fontSize: 14 }}>Preparing your book…</span>
      </div>
    );
  }

  const trim = TRIM_SIZES.find((t) => t.id === book.trimSizeId) ?? TRIM_SIZES[0];
  const font = FONT_PRESETS.find((f) => f.id === book.fontPresetId) ?? FONT_PRESETS[0];
  const totalWords = getTotalWords(book);
  const totalPages = getTotalPages(book);

  return (
    <>
      {/* ── Print styles injected inline ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: avoid; }
          @page {
            size: ${trim.widthIn}in ${trim.heightIn}in;
            margin: 0.85in 0.75in 0.85in 0.85in;
          }
        }
        @media screen {
          .print-page-wrapper {
            background: white;
            box-shadow: 0 4px 32px rgba(0,0,0,0.55);
          }
        }
      `}</style>

      {/* ── Screen toolbar (hidden on print) ── */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,14,26,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,180,122,0.12)',
        padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => router.push(`/write/${book.id}`)}
          className="btn-nav"
          style={{ fontSize: 12 }}
        >
          <ArrowLeft size={13} /> Back to Editor
        </button>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 11, color: 'rgba(201,180,122,0.45)' }}>
          {totalWords.toLocaleString()} words · {totalPages} pages · {trim.label}
        </span>

        {/* Publish coming soon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(201,180,122,0.07)', border: '1px solid rgba(201,180,122,0.18)', borderRadius: 8, padding: '6px 12px' }}>
          <Sparkles size={13} style={{ color: '#c9b87a' }} />
          <span style={{ fontSize: 11, color: '#c9b87a', fontWeight: 600 }}>Publish</span>
          <span style={{ fontSize: 9, color: 'rgba(201,180,122,0.5)', background: 'rgba(201,180,122,0.12)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Coming Soon</span>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-gold"
          style={{ padding: '7px 18px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <Printer size={13} /> Print / Save PDF
        </button>
      </div>

      {/* ── Page wrapper ── */}
      <div style={{ background: '#0d1320', minHeight: '100vh', paddingTop: 72, paddingBottom: 80 }}>

        {/* ── Publish callout banner (screen only) ── */}
        <div className="no-print" style={{ maxWidth: 720, margin: '0 auto 36px', padding: '0 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(201,180,122,0.09) 0%, rgba(150,180,220,0.06) 100%)',
            border: '1px solid rgba(201,180,122,0.18)',
            borderRadius: 12, padding: '18px 24px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
          }}>
            <Sparkles size={20} style={{ color: '#c9b87a', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e0cc', marginBottom: 5 }}>Publishing is on the way</div>
              <div style={{ fontSize: 12, color: 'rgba(200,210,225,0.55)', lineHeight: 1.7 }}>
                We&rsquo;re building a publishing pipeline so your book can reach readers as a beautifully formatted paperback or ebook.
                In the meantime, use <strong style={{ color: 'rgba(201,180,122,0.85)' }}>Print / Save PDF</strong> above to get a print-ready
                version of your manuscript at {trim.label} trim size — ready to upload to any print-on-demand service.
              </div>
            </div>
          </div>
        </div>

        {/* ── Rendered book pages ── */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Title page */}
          <div className="print-page print-page-wrapper" style={{
            width: '100%', aspectRatio: `${trim.widthIn} / ${trim.heightIn}`,
            borderRadius: 4, marginBottom: 32,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: font.fontFamily, padding: '10% 12%',
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 1, background: '#2c1f14', opacity: 0.3 }} />
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1410', lineHeight: 1.25, margin: 0 }}>{book.title}</h1>
              {book.author && (
                <p style={{ fontSize: 13, color: '#5a4a3a', margin: 0, letterSpacing: '0.08em' }}>{book.author}</p>
              )}
              <div style={{ width: 48, height: 1, background: '#2c1f14', opacity: 0.3 }} />
            </div>
            <div style={{ fontSize: 9, color: 'rgba(26,20,16,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {trim.label} · {totalWords.toLocaleString()} words
            </div>
          </div>

          {/* Chapters + pages */}
          {book.chapters.map((chapter, chIndex) => (
            <div key={chapter.id}>
              {chapter.pages.map((page, pageIndex) => {
                const isChapterOpener = pageIndex === 0;
                const wordCount = countWords(page.content);
                return (
                  <div
                    key={page.id}
                    className="print-page print-page-wrapper"
                    style={{
                      width: '100%',
                      aspectRatio: `${trim.widthIn} / ${trim.heightIn}`,
                      borderRadius: 4,
                      marginBottom: 32,
                      fontFamily: font.fontFamily,
                      fontSize: `${font.fontSizePt}pt`,
                      lineHeight: font.lineHeightMultiplier,
                      color: '#1a1410',
                      padding: '8% 10%',
                      position: 'relative',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Running header */}
                    <div style={{ position: 'absolute', top: '4%', left: '10%', right: '10%', display: 'flex', justifyContent: pageIndex % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                      <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,20,16,0.30)' }}>
                        {pageIndex % 2 === 0 ? book.title : chapter.title}
                      </span>
                    </div>

                    {/* Chapter title on opener */}
                    {isChapterOpener && (
                      <div style={{ marginBottom: '8%', paddingTop: '12%' }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(26,20,16,0.35)', marginBottom: 10 }}>
                          Chapter {chIndex + 1}
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1410', margin: 0, lineHeight: 1.3 }}>{chapter.title}</h2>
                        <div style={{ width: 32, height: 1, background: '#2c1f14', opacity: 0.25, marginTop: 14 }} />
                      </div>
                    )}

                    {/* Content */}
                    <div>
                      {page.content
                        ? page.content.split('\n').map((line, i) =>
                            line === '' ? (
                              <div key={i} style={{ height: `${font.lineHeightMultiplier * 0.55}em` }} />
                            ) : (
                              <div key={i} style={{ textIndent: i === 0 && isChapterOpener ? 0 : `${font.fontSizePt * 1.5}pt`, marginBottom: 0 }}>
                                {line}
                              </div>
                            )
                          )
                        : <span style={{ color: 'rgba(26,20,16,0.18)', fontStyle: 'italic' }}>[blank page]</span>
                      }
                    </div>

                    {/* Footer: page number */}
                    <div style={{ position: 'absolute', bottom: '4%', left: '10%', right: '10%', display: 'flex', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, color: 'rgba(26,20,16,0.30)' }}>{page.pageNumber}</span>
                    </div>

                    {/* Word count badge (screen only) */}
                    {wordCount > 0 && (
                      <div className="no-print" style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, color: 'rgba(26,20,16,0.25)', background: 'rgba(26,20,16,0.05)', borderRadius: 4, padding: '2px 5px' }}>
                        {wordCount}w
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
