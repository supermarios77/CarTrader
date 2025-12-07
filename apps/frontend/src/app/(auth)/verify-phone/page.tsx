'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2, Phone, ArrowLeft } from 'lucide-react';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [code, setCode] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (token && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [token]);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);
    setCode('');
    setToken(null);

    try {
      const response = await api.post<{ message: string; token: string }>('/auth/send-phone-verification', {
        phone: phone.trim(),
      });
      setToken(response.token);
      setSuccess('Verification code sent! Check your SMS or console logs (development mode).');
      setCountdown(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code.';
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!token) {
      setError('Please request a verification code first');
      return;
    }

    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/verify-phone', {
        token,
        code: code.trim(),
      });
      setIsVerified(true);
      setSuccess('Phone number verified successfully!');

      await refreshUser();

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
    setIsResending(true);
    setError(null);
    setSuccess(null);
    setCode('');

    try {
      const response = await api.post<{ message: string; token: string }>('/auth/resend-phone-verification', {});
      setToken(response.token);
      setSuccess('Verification code resent! Check your SMS or console logs (development mode).');
      setCountdown(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification code.';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setCode(digitsOnly);
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
          <p className="text-base text-[#666]">Verify your phone number</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-[40px] border border-[#e5e5e5] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-[#10b981]" />
              <h2 className="font-[var(--font-space-grotesk)] text-3xl font-semibold">Phone Verification</h2>
            </div>
            <p className="text-base text-[#666]">
              {isVerified
                ? 'Your phone number has been verified successfully!'
                : 'Enter your phone number and verification code'}
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

            {/* Success Message (for code sent) */}
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
                {/* Phone Input */}
                {!token && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSending}
                      placeholder="+1234567890"
                      className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendCode();
                        }
                      }}
                    />
                    <p className="text-xs text-[#666]">Include country code (e.g., +1 for US)</p>
                  </div>
                )}

                {/* Code Input */}
                {token && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-base font-medium">
                        Verification Code
                      </Label>
                      <Input
                        ref={codeInputRef}
                        id="code"
                        type="text"
                        inputMode="numeric"
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        disabled={isVerifying}
                        placeholder="000000"
                        maxLength={6}
                        className="h-16 rounded-full text-2xl text-center font-mono tracking-widest border-[#e5e5e5] bg-[#fafafa] focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && code.length === 6) {
                            handleVerify();
                          }
                        }}
                      />
                      <p className="text-xs text-[#666] text-center">Enter the 6-digit code sent to {phone}</p>
                    </div>

                    {/* Resend Code */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#666]">Didn&apos;t receive the code?</span>
                      {countdown > 0 ? (
                        <span className="text-[#666]">Resend in {countdown}s</span>
                      ) : (
                        <button
                          onClick={handleResend}
                          disabled={isResending}
                          className="font-semibold text-[#10b981] hover:text-[#059669] transition-colors disabled:opacity-50"
                        >
                          {isResending ? 'Sending...' : 'Resend Code'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {!isVerified && (
            <div className="mt-6 space-y-4">
              {!token ? (
                <Button
                  onClick={handleSendCode}
                  disabled={isSending || !phone.trim()}
                  className="w-full h-12 rounded-full bg-[#111] text-white hover:bg-[#222] text-base font-semibold"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || code.length !== 6}
                  className="w-full h-12 rounded-full bg-[#111] text-white hover:bg-[#222] text-base font-semibold"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Phone Number'
                  )}
                </Button>
              )}
              <div className="text-center text-sm text-[#666]">
                <Link
                  href="/"
                  className="font-semibold text-[#10b981] hover:text-[#059669] transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
