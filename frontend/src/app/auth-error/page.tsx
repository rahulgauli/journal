'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  please_restart_the_process: 'The sign-in link has already been used or expired. Please try signing in again.',
  state_mismatch: 'The sign-in session was interrupted. Please try again.',
  oauth_code_verifier_missing: 'Sign-in session data was lost. Please try again.',
  default: 'Something went wrong during sign-in. Please try again.',
};

function AuthErrorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params.get('error') ?? 'default';
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default;

  return (
    <main style={{ minHeight: '100vh', background: '#ede5d0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#f5eed9', border: '1px solid rgba(44,31,20,0.10)', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <BookOpen size={44} style={{ color: 'rgba(44,31,20,0.12)' }} />
            <AlertCircle size={18} style={{ color: '#7c2d3e', position: 'absolute', bottom: -2, right: -4 }} />
          </div>
        </div>
        <h1 style={{ fontSize: 20, fontFamily: 'Georgia, serif', color: '#2c1f14', marginBottom: 10 }}>Sign-in interrupted</h1>
        <p style={{ fontSize: 13, color: 'rgba(44,31,20,0.55)', lineHeight: 1.6, marginBottom: 28 }}>{message}</p>
        <button
          onClick={() => router.push('/login')}
          className="btn-gold"
          style={{ padding: '10px 32px', fontSize: 13 }}
        >
          Back to Sign In
        </button>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
