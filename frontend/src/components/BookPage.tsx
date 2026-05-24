'use client';

import { useRef, useEffect, useCallback } from 'react';
import { PageMetrics } from '@/lib/types';
import { countWords, countParagraphs } from '@/lib/api';

interface BookPageProps {
  content: string;
  pageNumber: number;
  totalPages: number;
  bookTitle: string;
  chapterTitle: string;
  chapterIndex: number;
  isFirstChapterPage: boolean;
  metrics: PageMetrics;
  isActive: boolean;
  isRightPage: boolean;
  onChange: (content: string) => void;
  onOverflow: (overflowText: string) => void;
  onFocus: () => void;
}

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

interface ParagraphsProps {
  content: string;
  fontSizePx: number;
  lineHeightPx: number;
  fontFamily: string;
  isFirstChapterPage: boolean;
  isActive: boolean;
}

function Paragraphs({ content, fontSizePx, lineHeightPx, fontFamily, isFirstChapterPage, isActive }: ParagraphsProps) {
  if (!content) {
    return isActive
      ? <span style={{ color: 'rgba(26,20,16,0.22)', fontStyle: 'italic', userSelect: 'none', fontFamily, fontSize: fontSizePx, lineHeight: `${lineHeightPx}px` }}>Begin writing…</span>
      : null;
  }

  const lines = content.split('\n');
  let firstTextFound = false;
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) {
      nodes.push(<div key={i} style={{ height: Math.round(lineHeightPx * 0.55) }} />);
      continue;
    }

    const isFirstPara = !firstTextFound;
    firstTextFound = true;

    // Drop cap on the very first paragraph of a chapter-opening page
    if (isFirstChapterPage && isFirstPara && line.length > 1) {
      const firstChar = line[0];
      const rest = line.slice(1);
      const dropCapSize = Math.round(lineHeightPx * 2.55);
      nodes.push(
        <div key={i} style={{ overflow: 'hidden', marginBottom: 1 }}>
          <span style={{
            float: 'left',
            fontSize: dropCapSize,
            lineHeight: `${Math.round(dropCapSize * 0.80)}px`,
            fontFamily,
            fontWeight: 600,
            marginRight: Math.round(fontSizePx * 0.28),
            marginTop: Math.round(fontSizePx * 0.08),
            color: '#2c1f14',
          }}>
            {firstChar}
          </span>
          <span style={{ fontSize: fontSizePx, lineHeight: `${lineHeightPx}px`, fontFamily, color: '#1a1410' }}>{rest}</span>
        </div>
      );
      continue;
    }

    nodes.push(
      <div key={i} style={{
        textIndent: isFirstPara ? 0 : `${Math.round(fontSizePx * 1.5)}px`,
        fontSize: fontSizePx,
        lineHeight: `${lineHeightPx}px`,
        fontFamily,
        color: '#1a1410',
      }}>
        {line}
      </div>
    );
  }

  return <>{nodes}</>;
}

export default function BookPage({
  content, pageNumber, totalPages, bookTitle, chapterTitle, chapterIndex,
  isFirstChapterPage, metrics, isActive, isRightPage,
  onChange, onOverflow, onFocus,
}: BookPageProps) {
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const measureRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overflowGuard      = useRef(false);
  const lastOverflowText   = useRef('');
  const prevContentRef     = useRef(content);

  const checkOverflow = useCallback(() => {
    if (overflowGuard.current) return;
    if (!measureRef.current || !containerRef.current) return;
    const maxH = containerRef.current.clientHeight;
    if (maxH <= 0) return;
    if (measureRef.current.scrollHeight <= maxH) return;

    overflowGuard.current = true;
    const words = content.split(/(\s+)/);
    let lo = 0, hi = words.length;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      measureRef.current.textContent = words.slice(0, mid).join('');
      if (measureRef.current.scrollHeight <= maxH) lo = mid; else hi = mid;
    }
    const fits    = words.slice(0, lo).join('');
    const overflow = words.slice(lo).join('').trimStart();

    if (overflow && overflow !== lastOverflowText.current) {
      lastOverflowText.current = overflow;
      setTimeout(() => {
        onChange(fits);
        onOverflow(overflow);
        setTimeout(() => { overflowGuard.current = false; }, 80);
      }, 0);
    } else {
      overflowGuard.current = false;
    }
  }, [content, onChange, onOverflow]);

  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      checkOverflow();
    }
  }, [content, checkOverflow]);

  const wPx = metrics.pageWidthPx;
  const hPx = metrics.pageHeightPx;
  const mT  = metrics.marginTopPx;
  const mB  = metrics.marginBottomPx;
  const mIn = metrics.marginInsidePx;
  const mOut = metrics.marginOutsidePx;
  const marginLeft  = isRightPage ? mIn  : mOut;
  const marginRight = isRightPage ? mOut : mIn;
  const headerFooterH = 20;

  const words = countWords(content);
  const paras = countParagraphs(content);
  const approx = metrics.approxWordsPerPage || 1;
  const pct = Math.min(100, Math.round((words / approx) * 100));

  const chapterHeaderHeight = isFirstChapterPage
    ? Math.round(metrics.lineHeightPx * 5.5)
    : 0;

  return (
    <div
      className={`paper-texture ${isRightPage ? 'page-shadow-right' : 'page-shadow-left'}`}
      style={{
        width: wPx, height: hPx,
        background: '#fdf8f0',
        position: 'relative',
        flexShrink: 0,
        cursor: 'text',
      }}
      onClick={() => { onFocus(); textareaRef.current?.focus(); }}
    >
      {/* Running header */}
      <div style={{
        position: 'absolute',
        top: Math.round(mT * 0.4),
        left: marginLeft, right: marginRight,
        height: headerFooterH,
        display: 'flex', alignItems: 'center',
        justifyContent: isRightPage ? 'flex-end' : 'flex-start',
      }}>
        <span style={{
          fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(26,20,16,0.32)', fontFamily: metrics.fontFamily,
        }}>
          {isRightPage ? chapterTitle : bookTitle}
        </span>
      </div>
      <div style={{
        position: 'absolute',
        top: Math.round(mT * 0.4) + headerFooterH,
        left: marginLeft, right: marginRight,
      }}>
        <hr className="running-rule" />
      </div>

      {/* Text area */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: mT, bottom: mB,
          left: marginLeft, right: marginRight,
          overflow: 'hidden',
        }}
      >
        {/* Measure div — pre-wrap to mirror textarea for overflow detection */}
        <div
          ref={measureRef}
          aria-hidden
          style={{
            position: 'absolute', top: chapterHeaderHeight, left: 0,
            width: metrics.textWidthPx,
            fontSize: metrics.fontSizePx,
            lineHeight: `${metrics.lineHeightPx}px`,
            fontFamily: metrics.fontFamily,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        {/* Chapter opening header */}
        {isFirstChapterPage && (
          <div style={{
            textAlign: 'center',
            paddingTop: Math.round(metrics.lineHeightPx * 1.8),
            paddingBottom: Math.round(metrics.lineHeightPx * 1.2),
            height: chapterHeaderHeight,
            boxSizing: 'border-box',
          }}>
            <div style={{
              fontSize: 8, letterSpacing: '0.32em', textTransform: 'uppercase',
              color: 'rgba(26,20,16,0.38)', fontFamily: metrics.fontFamily,
              marginBottom: 10,
            }}>
              Chapter {toRoman(chapterIndex + 1)}
            </div>
            <div style={{ width: 36, height: 1, background: 'rgba(26,20,16,0.18)', margin: '0 auto 10px' }} />
            <div style={{
              fontSize: Math.round(metrics.fontSizePx * 1.2),
              fontFamily: metrics.fontFamily,
              fontWeight: 600,
              color: '#1a1410',
              letterSpacing: '0.02em',
            }}>
              {chapterTitle}
            </div>
            <div style={{ width: 24, height: 1, background: 'rgba(26,20,16,0.12)', margin: '10px auto 0' }} />
          </div>
        )}

        {/* Rendered paragraphs */}
        <div style={{ position: 'relative' }}>
          <Paragraphs
            content={content}
            fontSizePx={metrics.fontSizePx}
            lineHeightPx={metrics.lineHeightPx}
            fontFamily={metrics.fontFamily}
            isFirstChapterPage={isFirstChapterPage}
            isActive={isActive}
          />
        </div>

        {/* Invisible textarea overlay for typing */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          className="book-textarea"
          spellCheck
          style={{
            fontSize: metrics.fontSizePx,
            lineHeight: `${metrics.lineHeightPx}px`,
            fontFamily: metrics.fontFamily,
            top: chapterHeaderHeight,
          }}
        />
      </div>

      {/* Page number folio */}
      <div style={{
        position: 'absolute',
        bottom: Math.round(mB * 0.4),
        left: marginLeft, right: marginRight,
        display: 'flex',
        justifyContent: isRightPage ? 'flex-end' : 'flex-start',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 9, color: 'rgba(26,20,16,0.32)', fontFamily: metrics.fontFamily }}>
          {pageNumber}
        </span>
      </div>

      {/* Live stats — active page only, opposite side from folio */}
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: Math.round(mB * 0.4),
          [isRightPage ? 'left' : 'right']: isRightPage ? marginLeft : marginRight,
          fontSize: 8, color: 'rgba(26,20,16,0.28)',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex', gap: 6,
        }}>
          <span>{words}w</span>
          <span>{paras}¶</span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}
