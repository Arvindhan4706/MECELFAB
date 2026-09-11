"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff,
  Shield
} from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────── */
const BG       = '#0a0a0a';
const SURFACE  = '#111111';
const BORDER   = '#1e1e1e';
const BORDER_FOCUS = '#4a4a4a';
const TEXT     = '#ffffff';
const MUTED    = '#a3a3a3';
const DIMMED   = '#333333';
const WHITE    = '#ffffff';

/* ─── Input component ────────────────────────────────────── */
function FormInput({ id, label, type = 'text', name, required, defaultValue, placeholder, autoComplete, icon: Icon, children }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: '8px' }}
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
          autoComplete={autoComplete || 'off'}
          suppressHydrationWarning
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `11px ${children ? '44px' : '13px'} 11px ${Icon ? '40px' : '13px'}`,
            fontSize: '16px',
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

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'OAuthAccountNotLinked') {
      return 'An account with this email already exists. Please log in with your email and password.';
    } else if (errorParam === 'CredentialsSignin') {
      return 'Invalid credentials. Please verify your email and password.';
    } else if (errorParam) {
      return 'An error occurred during authentication.';
    }
    return '';
  });

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [ready, setReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);


  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn('google', { callbackUrl: '/' });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.target);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: fd.get('email'),
        password: fd.get('password'),
      });
      if (res?.error) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <h1 style={{
          fontSize: '26px', fontWeight: 700, color: WHITE,
          fontFamily: 'Space Grotesk, Inter, sans-serif',
          letterSpacing: '-0.03em', lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          Sign in to your account
        </h1>
        <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.6 }}>
          Access your MECELFAB client portal to manage service requests, assets and billing.
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
      <form onSubmit={handleSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Email */}
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          name="email"
          required
          autoComplete="email"
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
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={Lock}
        >
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            tabIndex={-1}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            style={{
              background: 'none', border: 'none', padding: '8px',
              cursor: 'pointer', color: MUTED,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s ease',
              minWidth: '44px', minHeight: '44px', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </FormInput>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
          <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = WHITE} onMouseLeave={e => e.currentTarget.style.color = MUTED}>
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          suppressHydrationWarning
          style={{
            marginTop: '4px',
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px 20px',
            fontSize: '16px', fontWeight: 600,
            color: BG,
            background: loading ? '#d4d4d4' : WHITE,
            border: 'none', borderRadius: '6px',
            cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
            letterSpacing: '-0.01em',
            minHeight: '44px',
          }}
          onMouseEnter={e => { if (!loading && !googleLoading) e.currentTarget.style.background = '#e8e8e8'; }}
          onMouseLeave={e => { if (!loading && !googleLoading) e.currentTarget.style.background = WHITE; }}
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

      {/* ── Or Divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: DIMMED }} />
        <span style={{ padding: '0 12px', fontSize: '12px', color: MUTED, letterSpacing: '0.05em' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: DIMMED }} />
      </div>

      {/* ── Google Login ── */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          padding: '14px 20px',
          fontSize: '16px', fontWeight: 500,
          color: WHITE,
          background: 'transparent',
          border: `1px solid ${BORDER_FOCUS}`,
          borderRadius: '6px',
          cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          minHeight: '44px',
        }}
        onMouseEnter={e => { if (!loading && !googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { if (!loading && !googleLoading) e.currentTarget.style.background = 'transparent'; }}
      >
        {googleLoading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke={WHITE} strokeWidth="3" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span>Continue with Google</span>
      </button>


      {/* ── Footer ── */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: MUTED }}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{ color: WHITE, textDecoration: 'none', fontWeight: 500 }}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: TEXT, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
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
      }}>
        {/* Go Back Button */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: MUTED, textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = WHITE} onMouseLeave={e => e.currentTarget.style.color = MUTED}>
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Go back
          </Link>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', alignSelf: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color={BG} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: WHITE, fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '-0.02em' }}>
            MECELFAB
          </span>
        </div>

        <Suspense fallback={<div style={{ color: MUTED, fontSize: '13px' }}>Loading...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
