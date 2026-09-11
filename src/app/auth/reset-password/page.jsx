"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const BG       = '#0a0a0a';
const WHITE    = '#ffffff';
const MUTED    = '#525252';
const BORDER   = '#1e1e1e';
const BORDER_FOCUS = '#3a3a3a';
const TEXT     = '#e2e2e2';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !token) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Password reset successfully!' });
        setTimeout(() => {
          router.push('/auth/login?reset=success');
        }, 2000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Something went wrong' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '12px 14px', borderRadius: '6px', marginBottom: '20px',
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.2)',
        }}>
          <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#ef4444', lineHeight: 1.5 }}>
            Invalid or missing reset token.
          </p>
        </div>
        <div>
          <Link href="/auth/forgot-password" style={{ color: WHITE, fontSize: '13px' }}>
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: WHITE, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Set New Password
        </h1>
        <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
          Please enter your new password below. It must be at least 8 characters long.
        </p>
      </div>

      {status.message && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 14px', borderRadius: '6px', marginBottom: '20px',
          background: status.type === 'error' ? 'rgba(220,38,38,0.06)' : 'rgba(16,185,129,0.06)',
          border: `1px solid ${status.type === 'error' ? 'rgba(220,38,38,0.2)' : 'rgba(16,185,129,0.2)'}`,
        }}>
          {status.type === 'error' ? (
            <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
          ) : (
            <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
          )}
          <p style={{ fontSize: '13px', color: status.type === 'error' ? '#ef4444' : '#10b981', lineHeight: 1.5 }}>
            {status.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: '8px' }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused ? '#888' : '#3a3a3a', transition: 'color 0.15s ease' }} />
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%',
                padding: '11px 40px 11px 40px',
                fontSize: '16px',
                color: TEXT,
                background: focused ? '#161616' : '#0f0f0f',
                border: `1px solid ${focused ? BORDER_FOCUS : BORDER}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              tabIndex={-1}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: '8px',
                cursor: 'pointer', color: MUTED,
                display: 'flex', alignItems: 'center',
                minWidth: '44px', minHeight: '44px', justifyContent: 'center',
              }}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            marginTop: '4px',
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px 20px',
            fontSize: '16px', fontWeight: 600,
            color: BG,
            background: (loading || !password) ? '#d4d4d4' : WHITE,
            border: 'none', borderRadius: '6px',
            cursor: (loading || !password) ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            minHeight: '44px',
          }}
        >
          {loading ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke={BG} strokeWidth="3" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" stroke={BG} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span>Resetting...</span>
            </>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      color: TEXT,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
