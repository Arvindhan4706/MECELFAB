"use client";

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff,
  Shield, CheckCircle2
} from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────── */
const BG       = '#0a0a0a';
const BORDER   = '#1e1e1e';
const BORDER_FOCUS = '#3a3a3a';
const TEXT     = '#e2e2e2';
const MUTED    = '#525252';
const WHITE    = '#ffffff';

/* ─── Platform capabilities list ────────────────────────── */

/* ─── Input component ────────────────────────────────────── */
function FormInput({ id, label, type = 'text', name, required, defaultValue, placeholder, icon: Icon, children }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: '8px' }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            size={15}
            style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: focused ? '#888' : '#3a3a3a',
              transition: 'color 0.15s ease',
              pointerEvents: 'none',
            }}
          />
        )}
        <input
          ref={inputRef}
          id={id}
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          suppressHydrationWarning
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `11px ${children ? '44px' : '13px'} 11px ${Icon ? '40px' : '13px'}`,
            fontSize: '14px',
            color: TEXT,
            background: focused ? '#161616' : '#0f0f0f',
            border: `1px solid ${focused ? BORDER_FOCUS : BORDER}`,
            borderRadius: '6px',
            outline: 'none',
            transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
            boxShadow: focused ? `0 0 0 3px rgba(255,255,255,0.04)` : 'none',
            boxSizing: 'border-box',
          }}
          className="placeholder-[#2e2e2e]"
        />
        {children && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function LoginAdminPage() {
  const router   = useRouter();
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.target);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email:    fd.get('email'),
        password: fd.get('password'),
      });
      if (res?.error) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: TEXT, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>


      {/* ══════════════════════════════════════════════════
          LOGIN BOX
      ══════════════════════════════════════════════════ */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: BG,
        position: 'relative',
      }}
        className="w-full"
      >

        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', alignSelf: 'center' }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color={BG} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: WHITE, fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '-0.02em' }}>
            MECELFAB
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* ── Header ── */}
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Admin badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '4px',
              border: `1px solid ${BORDER}`,
              background: '#0f0f0f',
              marginBottom: '20px',
            }}>
              <Lock size={10} color={MUTED} />
              <span style={{ fontSize: '11px', color: MUTED, fontWeight: 500, letterSpacing: '0.06em' }}>Admin Access</span>
            </div>

            <h1 style={{
              fontSize: '26px', fontWeight: 700, color: WHITE,
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              letterSpacing: '-0.03em', lineHeight: 1.2,
              marginBottom: '8px',
            }}>
              Sign in to your account
            </h1>
            <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
              Enter your administrator credentials to access the control panel.
            </p>
          </div>

          {/* ── Error Alert ── */}
          {error && (
            <div
              role="alert"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 14px', borderRadius: '6px', marginBottom: '20px',
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.2)',
              }}
            >
              <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#ef4444', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              icon={Mail}
            />

            {/* Password */}
            <FormInput
              id="password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              name="password"
              required
              placeholder="Enter your password"
              icon={Lock}
            >
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none', border: 'none', padding: '4px',
                  cursor: 'pointer', color: MUTED,
                  display: 'flex', alignItems: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#888'}
                onMouseLeave={e => e.currentTarget.style.color = MUTED}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </FormInput>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              style={{
                marginTop: '4px',
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 20px',
                fontSize: '14px', fontWeight: 600,
                color: BG,
                background: loading ? '#d4d4d4' : WHITE,
                border: 'none', borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e8e8e8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = WHITE; }}
            >
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke={BG} strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke={BG} strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* ── Security footer ── */}
          <div style={{
            marginTop: '28px', paddingTop: '24px',
            borderTop: `1px solid ${BORDER}`,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
              {[
                'Authorized personnel only — unauthorized access is prohibited',
                'All login attempts and actions are logged and audited',
              ].map(text => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <CheckCircle2 size={12} color="#2e2e2e" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '11px', color: '#2e2e2e', lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
