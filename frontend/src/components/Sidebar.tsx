'use client';

import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Book } from '@/lib/types';
import { countWords, getTotalWords, getTotalPages } from '@/lib/api';

interface SidebarProps {
  book: Book;
  activeChapterId: string;
  activePageId: string;
  onNavigate: (chapterId: string, pageId: string) => void;
  onAddChapter: () => void;
  onRenameChapter: (chapterId: string, title: string) => void;
}

export default function Sidebar({ book, activeChapterId, activePageId, onNavigate, onAddChapter, onRenameChapter }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const bg = '#0d1420';

  function toggle(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  function startEdit(chId: string, title: string) {
    setEditing(chId); setEditVal(title);
  }

  function commitEdit(chId: string) {
    if (editVal.trim()) onRenameChapter(chId, editVal.trim());
    setEditing(null);
  }

  return (
    <div style={{
      width: collapsed ? 44 : 220,
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(201,180,122,0.12)',
      flexShrink: 0,
      overflow: 'hidden',
      transition: 'width 220ms ease',
    }}>
      {/* Header row: book title + collapse toggle */}
      <div style={{ padding: collapsed ? '14px 0' : '16px 14px 10px', borderBottom: '1px solid rgba(201,180,122,0.12)', display: 'flex', alignItems: collapsed ? 'center' : 'flex-start', justifyContent: collapsed ? 'center' : 'space-between', flexDirection: collapsed ? 'column' : 'row', gap: 6 }}>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e0cc', fontFamily: 'Georgia, serif', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
            {book.author && <div style={{ fontSize: 11, color: 'rgba(201,180,122,0.55)' }}>{book.author}</div>}
            <div style={{ fontSize: 10, color: 'rgba(201,180,122,0.38)', marginTop: 4 }}>
              {getTotalWords(book).toLocaleString()} words · {getTotalPages(book)} pages
            </div>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* When collapsed, show nothing else */}
      {collapsed && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 8 }}>
          {book.chapters.map((ch) => (
            <div
              key={ch.id}
              title={ch.title}
              onClick={() => { setCollapsed(false); }}
              style={{ width: 28, height: 28, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: activeChapterId === ch.id ? 'rgba(212,169,106,0.15)' : 'rgba(255,255,255,0.04)', transition: 'background 150ms' }}
            >
              <FileText size={12} color={activeChapterId === ch.id ? '#d4a96a' : 'rgba(255,255,255,0.3)'} />
            </div>
          ))}
        </div>
      )}

      {/* Expanded: chapter / page tree */}
      {!collapsed && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {book.chapters.map((ch) => {
          const isOpen = expanded[ch.id] !== false; // default open
          const chWords = ch.pages.reduce((a, p) => a + countWords(p.content), 0);
          return (
            <div key={ch.id}>
              {/* Chapter row */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 14px', cursor: 'pointer',
                  background: activeChapterId === ch.id ? 'rgba(201,180,122,0.10)' : 'transparent',
                }}
                onClick={() => toggle(ch.id)}
              >
                {isOpen ? <ChevronDown size={11} color="rgba(201,180,122,0.45)" /> : <ChevronRight size={11} color="rgba(201,180,122,0.45)" />}
                {editing === ch.id ? (
                  <input
                    autoFocus
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onBlur={() => commitEdit(ch.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(ch.id); if (e.key === 'Escape') setEditing(null); }}
                    style={{ flex: 1, background: 'rgba(201,180,122,0.08)', border: '1px solid rgba(201,180,122,0.22)', borderRadius: 3, color: '#e8e0cc', fontSize: 12, padding: '1px 4px', outline: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => { e.stopPropagation(); startEdit(ch.id, ch.title); }}
                    style={{ flex: 1, fontSize: 12, color: 'rgba(232,224,204,0.72)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {ch.title}
                  </span>
                )}
                <span style={{ fontSize: 9, color: 'rgba(201,180,122,0.35)', flexShrink: 0 }}>{chWords}w</span>
              </div>

              {/* Pages */}
              {isOpen && ch.pages.map((pg) => (
                <div
                  key={pg.id}
                  onClick={() => onNavigate(ch.id, pg.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 14px 4px 28px', cursor: 'pointer',
                    background: activePageId === pg.id ? 'rgba(201,180,122,0.12)' : 'transparent',
                  }}
                >
                  <FileText size={10} color={activePageId === pg.id ? '#c9b87a' : 'rgba(201,180,122,0.3)'} />
                  <span style={{ fontSize: 11, color: activePageId === pg.id ? '#c9b87a' : 'rgba(232,224,204,0.45)', flex: 1 }}>
                    Page {pg.pageNumber}
                  </span>
                  <span style={{ fontSize: 9, color: 'rgba(201,180,122,0.35)' }}>{countWords(pg.content)}w</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Add chapter */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(201,180,122,0.12)' }}>
        <button
          onClick={onAddChapter}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '6px 0', borderRadius: 6, fontSize: 11,
            background: 'rgba(201,180,122,0.07)', border: '1px solid rgba(201,180,122,0.15)',
            color: 'rgba(201,180,122,0.55)', cursor: 'pointer',
          }}
        >
          <Plus size={11} /> Add Chapter
        </button>
      </div>
        </>
      )}
    </div>
  );
}
