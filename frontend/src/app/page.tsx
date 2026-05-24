 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Trash2, Clock, LogOut, ArrowLeft, Check, Printer } from 'lucide-react';
import { apiLoadBooks, apiCreateBook, apiDeleteBook } from '@/lib/api';
import { signOut, useSession } from '@/lib/auth-client';
import { TRIM_SIZES, FONT_PRESETS, Book } from '@/lib/types';

// ── Book templates ────────────────────────────────────────────────────────
interface BookTemplate {
  id: string;
  label: string;
  description: string;
  coverBg: string;
  spineColor: string;
  titleColor: string;
  subtitleColor: string;
  trimId: string;
  fontId: string;
}

const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Warm parchment & timeless serif',
    coverBg: 'linear-gradient(160deg, #f5eed9 0%, #e0d3b0 100%)',
    spineColor: '#b8860b',
    titleColor: '#2c1f14',
    subtitleColor: '#6b5b4e',
    trimId: 'trade_6x9',
    fontId: 'lora_12',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Deep navy with gold lettering',
    coverBg: 'linear-gradient(160deg, #1e2d50 0%, #0f1929 100%)',
    spineColor: '#c9a84c',
    titleColor: '#e8d5a3',
    subtitleColor: 'rgba(232,213,163,0.55)',
    trimId: 'trade_6x9',
    fontId: 'garamond_12',
  },
  {
    id: 'sage',
    label: 'Sage',
    description: 'Forest calm & quiet prose',
    coverBg: 'linear-gradient(160deg, #3d5a47 0%, #243629 100%)',
    spineColor: '#a8c49e',
    titleColor: '#d4ead0',
    subtitleColor: 'rgba(212,234,208,0.55)',
    trimId: 'novella',
    fontId: 'crimson_12',
  },
  {
    id: 'crimson',
    label: 'Crimson',
    description: 'Bold, passionate & vivid',
    coverBg: 'linear-gradient(160deg, #7c2d3e 0%, #4d1a26 100%)',
    spineColor: '#f0a8b0',
    titleColor: '#fdf0f0',
    subtitleColor: 'rgba(253,240,240,0.55)',
    trimId: 'trade_6x9',
    fontId: 'lora_12',
  },
  {
    id: 'slate',
    label: 'Slate',
    description: 'Cool, measured & precise',
    coverBg: 'linear-gradient(160deg, #3d4f5c 0%, #252f38 100%)',
    spineColor: '#7eb0cc',
    titleColor: '#d8eaf4',
    subtitleColor: 'rgba(216,234,244,0.55)',
    trimId: 'a5',
    fontId: 'lora_11',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    description: 'Soft rose & romantic prose',
    coverBg: 'linear-gradient(160deg, #8c4f6a 0%, #5e2d44 100%)',
    spineColor: '#e8b8c8',
    titleColor: '#fce8f0',
    subtitleColor: 'rgba(252,232,240,0.55)',
    trimId: 'novella',
    fontId: 'garamond_12',
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    description: 'Dark matter & sharp words',
    coverBg: 'linear-gradient(160deg, #2e2e2e 0%, #181818 100%)',
    spineColor: '#888888',
    titleColor: '#e8e8e8',
    subtitleColor: 'rgba(232,232,232,0.5)',
    trimId: 'trade_55x85',
    fontId: 'lora_12',
  },
  {
    id: 'linen',
    label: 'Linen',
    description: 'Cream cloth & minimal lines',
    coverBg: 'linear-gradient(160deg, #ede4d3 0%, #d8cdb6 100%)',
    spineColor: '#7a5c3a',
    titleColor: '#3c2a1a',
    subtitleColor: '#6b5040',
    trimId: 'a5',
    fontId: 'garamond_12',
  },
];

export default function LibraryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [trimId, setTrimId] = useState(TRIM_SIZES[0].id);
  const [fontId, setFontId] = useState(FONT_PRESETS[0].id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiLoadBooks().then(setBooks).catch(console.error);
  }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const book = await apiCreateBook(title.trim(), author.trim(), trimId, fontId);
      setBooks((prev) => [book, ...prev]);
      router.push(`/write/${book.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await apiDeleteBook(id);
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }

  function selectTemplate(tpl: BookTemplate) {
    setSelectedTemplate(tpl);
    setTrimId(tpl.trimId);
    setFontId(tpl.fontId);
    setStep('details');
  }

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login';
        },
      },
    });
  }

  return (
    <main className="min-h-screen" style={{ background: '#080e1a', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed background image */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        filter: 'brightness(0.35) saturate(0.75)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(180deg, rgba(8,14,26,0.55) 0%, rgba(8,14,26,0.80) 50%, rgba(8,14,26,0.96) 100%)',
        zIndex: 1,
      }} />

      {/* Header */}
      <header style={{ background: 'rgba(8,14,26,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(150,180,220,0.10)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontFamily: 'Georgia, serif', color: '#f0e6d0', fontWeight: 600, letterSpacing: '0.01em' }}>Inkwell</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {session && <span style={{ fontSize: 12, color: 'rgba(240,230,208,0.35)' }}>{session.user.name || session.user.email}</span>}
          <button onClick={handleSignOut} className="btn-icon" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Two-column body ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 2, minHeight: 0 }}>

        {/* ── LEFT: New book panel ── */}
        <div style={{
          width: 360,
          flexShrink: 0,
          borderRight: '1px solid rgba(150,180,220,0.08)',
          background: 'rgba(8,14,26,0.60)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '32px 28px',
        }}>
          <h2 style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(200,210,225,0.45)', marginBottom: 20, fontWeight: 600 }}>New Book</h2>

          {/* ── Step 1: Template grid ── */}
          {step === 'template' && (
            <>
              <p style={{ fontSize: 12, color: 'rgba(200,210,225,0.38)', marginBottom: 20, lineHeight: 1.6 }}>Choose a cover style to begin.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {BOOK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => selectTemplate(tpl)}
                    className="template-card"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{
                      background: tpl.coverBg,
                      borderRadius: '3px 4px 4px 3px',
                      aspectRatio: '3/4',
                      position: 'relative',
                      boxShadow: '3px 5px 14px rgba(0,0,0,0.40)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '12px 10px',
                      gap: 6,
                    }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: tpl.spineColor, opacity: 0.85 }} />
                      <div style={{ width: '70%', height: 1, background: tpl.spineColor, opacity: 0.45, marginBottom: 4 }} />
                      <div style={{ fontSize: 10, fontFamily: 'Georgia, serif', color: tpl.titleColor, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, letterSpacing: '0.02em' }}>{tpl.label}</div>
                      <div style={{ width: '70%', height: 1, background: tpl.spineColor, opacity: 0.45, marginTop: 4 }} />
                    </div>
                    <div style={{ marginTop: 7, paddingLeft: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#ddd8c8' }}>{tpl.label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(200,210,225,0.40)', marginTop: 2, lineHeight: 1.4 }}>{tpl.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 2: Details form ── */}
          {step === 'details' && selectedTemplate && (
            <>
              {/* Back */}
              <button onClick={() => setStep('template')} className="btn-nav" style={{ marginLeft: -8, marginBottom: 18, width: 'fit-content' }}>
                <ArrowLeft size={13} /> Back
              </button>

              {/* Mini template badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '10px 12px', background: 'rgba(150,180,220,0.06)', borderRadius: 10, border: '1px solid rgba(150,180,220,0.12)' }}>
                <div style={{ width: 26, height: 34, borderRadius: '2px 3px 3px 2px', background: selectedTemplate.coverBg, boxShadow: '2px 3px 8px rgba(0,0,0,0.4)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: selectedTemplate.spineColor, opacity: 0.9 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e0cc' }}>{selectedTemplate.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(200,210,225,0.45)' }}>{selectedTemplate.description}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'rgba(180,200,230,0.55)', display: 'flex' }}>
                  <Check size={14} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Title', value: title, set: setTitle, placeholder: 'My Novel' },
                  { label: 'Author', value: author, set: setAuthor, placeholder: 'Your name' },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,210,225,0.40)', marginBottom: 6 }}>{label}</label>
                    <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} className="field-input" style={{ padding: '9px 12px' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,210,225,0.40)', marginBottom: 6 }}>Book Size</label>
                  <select value={trimId} onChange={(e) => setTrimId(e.target.value)} className="field-input" style={{ padding: '9px 12px' }}>
                    {TRIM_SIZES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,210,225,0.40)', marginBottom: 6 }}>Font</label>
                  <select value={fontId} onChange={(e) => setFontId(e.target.value)} className="field-input" style={{ padding: '9px 12px' }}>
                    {FONT_PRESETS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!title.trim() || loading}
                className="btn-gold"
                style={{ marginTop: 22, padding: '11px 0', fontSize: 13, width: '100%' }}
              >
                {loading ? 'Creating…' : 'Start Writing'}
              </button>
            </>
          )}
        </div>

        {/* ── RIGHT: Shelf ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
          <h2 style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(200,210,225,0.45)', marginBottom: 24, fontWeight: 600 }}>Your Shelf</h2>

          {books.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 12 }}>
              <BookOpen size={48} style={{ color: 'rgba(150,180,220,0.10)' }} />
              <p style={{ fontSize: 14, color: 'rgba(200,210,225,0.28)', fontFamily: 'Georgia, serif' }}>No books yet — create your first one.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 28 }}>
              {books.map((book) => {
                // Derive a consistent template from the book id
                const tpl = BOOK_TEMPLATES[
                  book.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % BOOK_TEMPLATES.length
                ];
                return (
                  <div key={book.id} className="book-card" onClick={() => router.push(`/write/${book.id}`)}>
                    {/* Book cover */}
                    <div className="book-card-cover" style={{ background: tpl.coverBg, padding: 0, overflow: 'hidden', position: 'relative', borderRadius: '3px 5px 5px 3px' }}>
                      {/* Spine */}
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, background: tpl.spineColor, opacity: 0.85 }} />
                      {/* Cover content */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px 14px 16px 18px', gap: 8 }}>
                        <div style={{ width: '72%', height: 1, background: tpl.spineColor, opacity: 0.40 }} />
                        <div style={{ fontSize: 11, fontFamily: 'Georgia, serif', color: tpl.titleColor, fontWeight: 700, textAlign: 'center', lineHeight: 1.35, letterSpacing: '0.02em', wordBreak: 'break-word' }}>{book.title}</div>
                        {book.author && (
                          <div style={{ fontSize: 9, color: tpl.subtitleColor, textAlign: 'center', letterSpacing: '0.05em', lineHeight: 1.3 }}>{book.author}</div>
                        )}
                        <div style={{ width: '72%', height: 1, background: tpl.spineColor, opacity: 0.40 }} />
                      </div>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(book.id, e)}
                      className="delete-btn"
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: 5, padding: '4px 5px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center' }}
                      title="Delete book"
                    >
                      <Trash2 size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`/print/${book.id}`, '_blank'); }}
                      className="delete-btn"
                      style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: 5, padding: '4px 5px', cursor: 'pointer', color: 'rgba(201,180,122,0.80)', display: 'flex', alignItems: 'center' }}
                      title="Print / Save PDF"
                    >
                      <Printer size={11} />
                    </button>
                    {/* Below-cover metadata */}
                    <div style={{ marginTop: 8, paddingLeft: 2 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#ddd8c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 10, color: 'rgba(200,210,225,0.32)' }}>
                        <Clock size={9} /><span>{new Date(book.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
