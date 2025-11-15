'use client';

/**
 * Phone Verification Page
 * Handles phone verification with 6-digit code
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus code input when token is received
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
      const response = await api.post<{ message: string; token: string }>(
        '/auth/send-phone-verification',
        { phone: phone.trim() },
      );
      setToken(response.token);
      setSuccess('Verification code sent! Check your SMS or console logs (development mode).');
      setCountdown(60); // 60 second countdown
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
      
      // Refresh user data
      await refreshUser();
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
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
      const response = await api.post<{ message: string; token: string }>(
        '/auth/resend-phone-verification',
        {},
      );
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
    // Only allow digits and limit to 6
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setCode(digitsOnly);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md space-y-10">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              🚗 CarTrader
            </h1>
          </Link>
          <p className="text-base text-muted-foreground">
            Verify your phone number
          </p>
        </div>

        {/* Verification Card */}
        <Card className="border-2 rounded-3xl shadow-xl dark:shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 px-8 pt-10 pb-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Phone className="h-6 w-6" />
              Phone Verification
            </CardTitle>
            <CardDescription className="text-base">
              {isVerified
                ? 'Your phone number has been verified successfully!'
                : 'Enter your phone number and verification code'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            {/* Success Message */}
            {isVerified && (
              <div
                className="flex items-center gap-3 rounded-2xl border-2 border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400"
                role="alert"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && !isVerified && (
              <div
                className="flex items-center gap-3 rounded-2xl border-2 border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Success Message (for code sent) */}
            {success && !isVerified && (
              <div
                className="flex items-center gap-3 rounded-2xl border-2 border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400"
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
                  <div className="space-y-3">
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
                      className="h-12 rounded-xl text-base border-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendCode();
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>
                )}

                {/* Code Input */}
                {token && (
                  <>
                    <div className="space-y-3">
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
                        className="h-16 rounded-xl text-2xl text-center font-mono tracking-widest border-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && code.length === 6) {
                            handleVerify();
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code sent to {phone}
                      </p>
                    </div>

                    {/* Resend Code */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Didn&apos;t receive the code?
                      </span>
                      {countdown > 0 ? (
                        <span className="text-muted-foreground">
                          Resend in {countdown}s
                        </span>
                      ) : (
                        <button
                          onClick={handleResend}
                          disabled={isResending}
                          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                          {isResending ? 'Sending...' : 'Resend Code'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>

          {!isVerified && (
            <CardFooter className="flex flex-col space-y-5 px-8 pb-10">
              {!token ? (
                <Button
                  onClick={handleSendCode}
                  disabled={isSending || !phone.trim()}
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all"
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
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all"
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
              <div className="text-center text-sm text-muted-foreground">
                <Link
                  href="/"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

