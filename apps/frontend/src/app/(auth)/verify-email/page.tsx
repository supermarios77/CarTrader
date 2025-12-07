'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState(tokenFromUrl || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  const handleVerify = async () => {
    if (!token.trim()) {
      setError('Please enter a verification token');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/verify-email', { token: token.trim() });
      setIsVerified(true);
      setSuccess('Email verified successfully!');

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/resend-verification', { email: email.trim() });
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email.';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] flex items-center justify-center px-4 py-16">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <h1 className="font-[var(--font-space-grotesk)] text-5xl font-bold tracking-tight">
              Car<span className="text-[#10b981]">Trader</span>
            </h1>
          </Link>
          <p className="text-base text-[#666]">Verify your email address</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-[40px] border border-[#e5e5e5] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-[#10b981]" />
              <h2 className="font-[var(--font-space-grotesk)] text-3xl font-semibold">Email Verification</h2>
            </div>
            <p className="text-base text-[#666]">
              {isVerified
                ? 'Your email has been verified successfully!'
                : 'Enter the verification token from your email'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Success Message */}
            {isVerified && (
              <div
                className="flex items-center gap-3 rounded-xl border border-[#10b981] bg-[#f0fdf4] p-4 text-sm text-[#059669]"
                role="alert"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && !isVerified && (
              <div
                className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Success Message (for resend) */}
            {success && !isVerified && (
              <div
                className="flex items-center gap-3 rounded-xl border border-[#10b981] bg-[#f0fdf4] p-4 text-sm text-[#059669]"
                role="alert"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {!isVerified && (
              <>
                {/* Token Input */}
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-base font-medium">
                    Verification Token
                  </Label>
                  <Input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isVerifying}
                    placeholder="Enter verification token from email"
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleVerify();
                      }
                    }}
                  />
                  <p className="text-xs text-[#666]">Check your email for the verification link or token</p>
                </div>

                {/* Resend Section */}
                <div className="border-t border-[#e5e5e5] pt-6 space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Didn&apos;t receive the email?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isResending}
                      placeholder="Enter your email"
                      className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleResend();
                        }
                      }}
                    />
                    <Button
                      onClick={handleResend}
                      disabled={isResending || !email.trim()}
                      className="h-12 rounded-full bg-[#10b981] text-white hover:bg-[#059669] px-6"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend'
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isVerified && (
            <div className="mt-6 space-y-4">
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !token.trim()}
                className="w-full h-12 rounded-full bg-[#111] text-white hover:bg-[#222] text-base font-semibold"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
              <div className="text-center text-sm text-[#666]">
                <Link href="/login" className="font-semibold text-[#10b981] hover:text-[#059669] transition-colors">
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
