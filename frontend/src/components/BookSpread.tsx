'use client';

import BookPage from './BookPage';
import { PageMetrics } from '@/lib/types';

export interface SpreadPage {
  id: string;
  chapterId: string;
  content: string;
  pageNumber: number;
  totalPages: number;
  chapterTitle: string;
  isFirstChapterPage: boolean;
  chapterIndex: number;
}

interface BookSpreadProps {
  leftPage?: SpreadPage;
  rightPage?: SpreadPage;
  metrics: PageMetrics;
  activePageId: string;
  bookTitle: string;
  onPageChange: (chapterId: string, pageId: string, content: string) => void;
  onOverflow: (chapterId: string, pageId: string, overflowText: string) => void;
  onPageFocus: (pageId: string) => void;
}

export default function BookSpread({
  leftPage, rightPage, metrics, activePageId, bookTitle,
  onPageChange, onOverflow, onPageFocus,
}: BookSpreadProps) {
  return (
    <div className="book-outer-shadow" style={{ display: 'flex', alignItems: 'stretch' }}>
      {/* Left page */}
      <div className="page-stack-left">
        {leftPage ? (
          <BookPage
            content={leftPage.content}
            pageNumber={leftPage.pageNumber}
            totalPages={leftPage.totalPages}
            bookTitle={bookTitle}
            chapterTitle={leftPage.chapterTitle}
            isFirstChapterPage={leftPage.isFirstChapterPage}
            chapterIndex={leftPage.chapterIndex}
            metrics={metrics}
            isActive={activePageId === leftPage.id}
            isRightPage={false}
            onChange={(c) => onPageChange(leftPage.chapterId, leftPage.id, c)}
            onOverflow={(ov) => onOverflow(leftPage.chapterId, leftPage.id, ov)}
            onFocus={() => onPageFocus(leftPage.id)}
          />
        ) : (
          <BlankPage metrics={metrics} isRight={false} />
        )}
      </div>

      {/* Spine crease */}
      <div className="spine-crease" style={{ height: metrics.pageHeightPx }} />

      {/* Right page */}
      <div className="page-stack-right">
        {rightPage ? (
          <BookPage
            content={rightPage.content}
            pageNumber={rightPage.pageNumber}
            totalPages={rightPage.totalPages}
            bookTitle={bookTitle}
            chapterTitle={rightPage.chapterTitle}
            isFirstChapterPage={rightPage.isFirstChapterPage}
            chapterIndex={rightPage.chapterIndex}
            metrics={metrics}
            isActive={activePageId === rightPage.id}
            isRightPage={true}
            onChange={(c) => onPageChange(rightPage.chapterId, rightPage.id, c)}
            onOverflow={(ov) => onOverflow(rightPage.chapterId, rightPage.id, ov)}
            onFocus={() => onPageFocus(rightPage.id)}
          />
        ) : (
          <BlankPage metrics={metrics} isRight={true} />
        )}
      </div>
    </div>
  );
}

function BlankPage({ metrics, isRight }: { metrics: PageMetrics; isRight: boolean }) {
  return (
    <div
      className={`paper-texture ${isRight ? 'page-shadow-right' : 'page-shadow-left'}`}
      style={{ width: metrics.pageWidthPx, height: metrics.pageHeightPx, background: '#fdf8f0', position: 'relative' }}
    >
      {/* Subtle centred ornament — signals intentional blank verso/recto */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.10 }}>
          {/* Left flourish */}
          <path d="M2 12 C6 6, 10 4, 14 8 C10 10, 8 14, 12 16 C8 15, 4 14, 2 12Z" fill="#2c1f14"/>
          {/* Right flourish (mirrored) */}
          <path d="M46 12 C42 6, 38 4, 34 8 C38 10, 40 14, 36 16 C40 15, 44 14, 46 12Z" fill="#2c1f14"/>
          {/* Centre diamond */}
          <rect x="22" y="10" width="4" height="4" transform="rotate(45 24 12)" fill="#2c1f14"/>
          {/* Hairlines */}
          <line x1="4" y1="12" x2="18" y2="12" stroke="#2c1f14" strokeWidth="0.5"/>
          <line x1="30" y1="12" x2="44" y2="12" stroke="#2c1f14" strokeWidth="0.5"/>
        </svg>
      </div>
    </div>
  );
}
