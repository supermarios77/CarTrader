'use client';

/**
 * Email Verification Page
 * Handles email verification via token from URL or manual entry
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

  // Auto-verify if token is in URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify();
    }
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
            Verify your email address
          </p>
        </div>

        {/* Verification Card */}
        <Card className="border-2 rounded-3xl shadow-xl dark:shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 px-8 pt-10 pb-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Email Verification
            </CardTitle>
            <CardDescription className="text-base">
              {isVerified
                ? 'Your email has been verified successfully!'
                : 'Enter the verification token from your email'}
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

            {/* Success Message (for resend) */}
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
                {/* Token Input */}
                <div className="space-y-3">
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
                    className="h-12 rounded-xl text-base border-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleVerify();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Check your email for the verification link or token
                  </p>
                </div>

                {/* Resend Section */}
                <div className="border-t border-border/50 pt-6 space-y-3">
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
                      className="h-12 rounded-xl text-base border-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleResend();
                        }
                      }}
                    />
                    <Button
                      onClick={handleResend}
                      disabled={isResending || !email.trim()}
                      className="h-12 rounded-xl px-6"
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
          </CardContent>

          {!isVerified && (
            <CardFooter className="flex flex-col space-y-5 px-8 pb-10">
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !token.trim()}
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all"
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
              <div className="text-center text-sm text-muted-foreground">
                <Link
                  href="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

