"use client";

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ArrowLeft, Home, Shield } from 'lucide-react';

const BG       = '#0a0a0a';
const BORDER   = '#1e1e1e';
const TEXT     = '#e2e2e2';
const MUTED    = '#525252';
const WHITE    = '#ffffff';

export default function SignOutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const firstName = session?.user?.name?.split(' ')[0] || 'there';

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top bar ── */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={12} color={BG} />
        </div>
        <span style={{
          fontSize: '14px', fontWeight: 700, color: WHITE,
          fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '-0.02em',
        }}>
          MECELFAB
        </span>
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Icon */}
          <div style={{
            width: '56px', height: '56px',
            border: `1px solid ${BORDER}`,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '28px',
          }}>
            <LogOut size={22} color={MUTED} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '22px', fontWeight: 700, color: WHITE,
            fontFamily: 'Space Grotesk, Inter, sans-serif',
            letterSpacing: '-0.03em', lineHeight: 1.3,
            marginBottom: '8px',
          }}>
            Sign out, {firstName}?
          </h1>
          <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.7, marginBottom: '32px' }}>
            You are signed in as <span style={{ color: '#888' }}>{session?.user?.email || 'your account'}</span>.
            Signing out will end your current session.
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: BORDER, marginBottom: '28px' }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleSignOut}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '14px', fontWeight: 600,
                color: '#ef4444',
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.18)',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.15s ease, border-color 0.15s ease',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'; }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.18)'; }}}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing out…
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  Yes, sign me out
                </>
              )}
            </button>

            <Link
              href={session?.user?.role === 'ADMIN' ? '/admin/dashboard' : session ? '/portal' : '/'}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '14px', fontWeight: 500,
                color: '#aaa',
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.15s ease, color 0.15s ease',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = WHITE; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#aaa'; }}
            >
              <ArrowLeft size={14} />
              Go back to Dashboard
            </Link>

            <Link
              href="/"
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '13px', fontWeight: 400,
                color: MUTED,
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'color 0.15s ease',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#888'; }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; }}
            >
              <Home size={13} />
              Return to main website
            </Link>
          </div>

          {/* Footer note */}
          <p style={{ marginTop: '32px', fontSize: '11px', color: '#2e2e2e', lineHeight: 1.6 }}>
            Your session data will be cleared from this browser. Any unsaved changes will be lost.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
