"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const BG       = '#0a0a0a';
const WHITE    = '#ffffff';
const MUTED    = '#525252';
const TEXT     = '#e2e2e2';

function VerifyEmailLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(() => {
    if (!token) {
      return { type: 'error', message: 'Invalid or missing verification token.' };
    }
    return { type: 'loading', message: 'Verifying your email address...' };
  });

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus({ type: 'success', message: 'Email verified successfully! Redirecting...' });
          setTimeout(() => {
            router.push('/auth/login?verified=true');
          }, 2000);
        } else {
          setStatus({ type: 'error', message: data.message || 'Verification failed.' });
        }
      } catch {
        setStatus({ type: 'error', message: 'Failed to verify email.' });
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div style={{ textAlign: 'center' }}>
      {status.type === 'loading' && (
        <>
          <Loader2 size={32} color={MUTED} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: WHITE, marginBottom: '8px' }}>
            Verifying Email
          </h1>
          <p style={{ fontSize: '13px', color: MUTED }}>{status.message}</p>
        </>
      )}

      {status.type === 'success' && (
        <>
          <div style={{ width: '56px', height: '56px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MailCheck size={24} color="#10b981" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: WHITE, marginBottom: '8px' }}>
            Email Verified
          </h1>
          <p style={{ fontSize: '13px', color: MUTED }}>{status.message}</p>
        </>
      )}

      {status.type === 'error' && (
        <>
          <div style={{ width: '56px', height: '56px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={24} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: WHITE, marginBottom: '8px' }}>
            Verification Failed
          </h1>
          <p style={{ fontSize: '13px', color: MUTED, marginBottom: '24px' }}>{status.message}</p>
          <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: WHITE, color: BG, borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Go to Login <ArrowRight size={14} />
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
            <VerifyEmailLogic />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
