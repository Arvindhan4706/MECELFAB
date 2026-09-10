"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const BG       = '#0a0a0a';
const WHITE    = '#ffffff';
const MUTED    = '#525252';
const BORDER   = '#1e1e1e';
const BORDER_FOCUS = '#3a3a3a';
const TEXT     = '#e2e2e2';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'If an account exists, a reset link has been sent.' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Something went wrong' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to request password reset' });
    } finally {
      setLoading(false);
    }
  };

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
          
          <div style={{ marginBottom: '32px' }}>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: MUTED, textDecoration: 'none', marginBottom: '24px', transition: 'color 0.15s' }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: WHITE, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Reset Password
            </h1>
            <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
              Enter the email associated with your account and we'll send you a link to reset your password.
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
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused ? '#888' : '#3a3a3a', transition: 'color 0.15s ease' }} />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    width: '100%',
                    padding: '11px 13px 11px 40px',
                    fontSize: '14px',
                    color: TEXT,
                    background: focused ? '#161616' : '#0f0f0f',
                    border: `1px solid ${focused ? BORDER_FOCUS : BORDER}`,
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                marginTop: '4px',
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 20px',
                fontSize: '14px', fontWeight: 600,
                color: BG,
                background: (loading || !email) ? '#d4d4d4' : WHITE,
                border: 'none', borderRadius: '6px',
                cursor: (loading || !email) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke={BG} strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke={BG} strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
