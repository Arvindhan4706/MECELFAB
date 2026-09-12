"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff,
  User as UserIcon
} from 'lucide-react';
import Image from 'next/image';

/* ─── Design tokens ─────────────────────────────────────── */
const BG       = '#0a0a0a';
const BORDER   = '#1e1e1e';
const BORDER_FOCUS = '#4a4a4a';
const TEXT     = '#ffffff';
const MUTED    = '#a3a3a3';
const WHITE    = '#ffffff';

/* ─── Input component ────────────────────────────────────── */
function FormInput({ id, label, type = 'text', name, required, placeholder, autoComplete, icon: Icon, children }) {
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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.target);
    const name = fd.get('name');
    const email = fd.get('email');
    const password = fd.get('password');
    const confirmPassword = fd.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'An error occurred during registration.');
        setLoading(false);
        return;
      }

      // Automatically sign in the user after successful registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError('Registration successful, but login failed. Please sign in manually.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: TEXT, fontFamily: 'Inter, sans-serif', padding: '40px 0' }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 32px',
        background: BG,
      }}>
        {/* Go Back Button */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: MUTED, textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.color = WHITE} onMouseLeave={e => e.currentTarget.style.color = MUTED}>
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Go back
          </Link>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px' }}>
          <Image
            src="/images/logo-mark.jpeg"
            alt="MECELFAB"
            width={56}
            height={56}
            className="rounded-xl"
          />
          <span style={{ fontSize: '32px', fontWeight: 700, color: WHITE, fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '-0.02em' }}>
            MECELFAB
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: '360px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: WHITE, fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '-0.03em', marginBottom: '8px' }}>
              Create a client account
            </h1>
            <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.6 }}>
              Register to access the MECELFAB client portal and submit service requests, track work orders, and manage your equipment.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '6px', marginBottom: '20px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#ef4444', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px 20px', fontSize: '16px', fontWeight: 500, color: WHITE,
              background: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: '6px',
              cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer', transition: 'background 0.15s ease',
              marginBottom: '20px', minHeight: '44px',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: BORDER }}></div>
            <span style={{ padding: '0 10px', fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or</span>
            <div style={{ flex: 1, height: '1px', background: BORDER }}></div>
          </div>

          <form onSubmit={handleSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormInput
              id="name" label="Full Name" type="text" name="name" required autoComplete="name" placeholder="John Doe" icon={UserIcon}
            />
            <FormInput
              id="email" label="Email Address" type="email" name="email" required autoComplete="email" placeholder="john@example.com" icon={Mail}
            />
            <FormInput
              id="password" label="Password" type={showPw ? 'text' : 'password'} name="password" required autoComplete="new-password" placeholder="Create a strong password" icon={Lock}
            >
              <button
                type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', minWidth: '44px', minHeight: '44px', justifyContent: 'center' }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </FormInput>
            <FormInput
              id="confirmPassword" label="Confirm Password" type={showPwConfirm ? 'text' : 'password'} name="confirmPassword" required autoComplete="new-password" placeholder="Confirm your password" icon={Lock}
            >
              <button
                type="button" onClick={() => setShowPwConfirm(v => !v)} tabIndex={-1}
                style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', minWidth: '44px', minHeight: '44px', justifyContent: 'center' }}
              >
                {showPwConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </FormInput>

            <button
              type="submit" disabled={loading || googleLoading}
              style={{
                marginTop: '4px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px 20px', fontSize: '16px', fontWeight: 600, color: BG, background: loading ? '#d4d4d4' : WHITE,
                border: 'none', borderRadius: '6px', cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer', minHeight: '44px',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: MUTED }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: WHITE, textDecoration: 'none', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
