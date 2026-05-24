 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signup') {
        const res = await signUp.email({ name, email, password });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await signIn.social({ provider: 'google', callbackURL: '/' });
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        position: 'relative',
        background: '#0a0d14',
        overflow: 'hidden',
      }}
    >
      {/* Full-bleed background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        filter: 'brightness(0.55) saturate(0.9)',
        zIndex: 0,
      }} />
      {/* Cool navy gradient overlay — deepens bottom, lets image breathe at top */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(170deg, rgba(8,14,26,0.38) 0%, rgba(8,14,26,0.72) 55%, rgba(8,14,26,0.92) 100%)',
        zIndex: 1,
      }} />

      <div className="w-full max-w-sm px-4" style={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: 'Georgia, serif', color: '#f0ecdf', letterSpacing: '0.02em' }}
          >
            Inkwell
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(220,210,185,0.52)' }}>
            Your stories, beautifully kept
          </p>
        </div>

        {/* Card — frosted glass */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(10,14,22,0.72)',
            border: '1px solid rgba(201,180,122,0.14)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 1px 0 rgba(201,180,122,0.08) inset',
          }}
        >
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden mb-5" style={{ background: 'rgba(201,146,42,0.07)' }}>
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2 text-sm font-medium transition-all"
                style={{
                  background: tab === t ? 'rgba(201,146,42,0.18)' : 'transparent',
                  color: tab === t ? '#f0e6d0' : 'rgba(240,230,208,0.42)',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google sign-in */}
          <button onClick={handleGoogle} className="btn-google mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.805 10.023H12v3.977h5.617c-.242 1.242-1.004 2.297-2.133 3.007v2.5h3.453c2.016-1.86 3.195-4.598 3.195-7.852 0-.656-.063-1.293-.172-1.914l-.155.282z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.965-.895 6.617-2.43l-3.453-2.5c-.895.602-2.04.957-3.164.957-2.43 0-4.488-1.641-5.227-3.844H3.182v2.578C4.836 19.852 8.18 22 12 22z" fill="#34A853"/>
              <path d="M6.773 14.183A5.983 5.983 0 0 1 6.363 12c0-.758.13-1.492.41-2.183V7.239H3.182A9.994 9.994 0 0 0 2 12c0 1.617.387 3.148 1.182 4.761l3.59-2.578z" fill="#FBBC05"/>
              <path d="M12 6.113c1.367 0 2.594.469 3.563 1.39l2.672-2.672C16.96 3.297 14.695 2 12 2 8.18 2 4.836 4.148 3.182 7.239l3.59 2.578C7.512 7.754 9.57 6.113 12 6.113z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(240,230,208,0.10)' }} />
            <span className="text-xs" style={{ color: 'rgba(240,230,208,0.30)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(240,230,208,0.10)' }} />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === 'signup' && (
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240,230,208,0.28)' }} />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="field-input pl-9 pr-3 py-2.5"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240,230,208,0.28)' }} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field-input pl-9 pr-3 py-2.5"
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240,230,208,0.28)' }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="field-input pl-9 pr-3 py-2.5"
              />
            </div>

            {error && (
              <p className="text-xs px-1" style={{ color: '#f87171' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-2.5 text-sm"
            >
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
