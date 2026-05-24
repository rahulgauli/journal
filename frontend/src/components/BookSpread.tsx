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
      style={{ width: metrics.pageWidthPx, height: metrics.pageHeightPx, background: '#fdf8f0' }}
    />
  );
}
