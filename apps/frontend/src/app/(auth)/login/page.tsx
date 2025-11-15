'use client';

/**
 * Login Page - Production-ready login form with shadcn/ui components
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ApiClientError } from '@/lib/api-client';
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
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 1) {
      errors.password = 'Password cannot be empty';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof newErrors];
        return newErrors;
      });
    }
    
    // Clear API error when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Redirect to home page on success
      router.push('/');
      router.refresh();
    } catch (err) {
      // Error is handled by auth context
      // In production, consider sending to error tracking service
      if (process.env.NODE_ENV === 'development' && err instanceof ApiClientError) {
        // Only log in development for debugging
        // Error is handled by setError below
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

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
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-2 rounded-3xl shadow-xl dark:shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 px-8 pt-10 pb-6">
            <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your email and password to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-8">
              {/* API Error Message */}
              {error && (
                <div
                  className="flex items-center gap-3 rounded-2xl border-2 border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="you@example.com"
                  className={`h-12 rounded-xl text-base ${validationErrors.email ? 'border-2 border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-2 focus-visible:ring-2 focus-visible:ring-blue-500'}`}
                  aria-invalid={validationErrors.email ? 'true' : 'false'}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                />
                {validationErrors.email && (
                  <p
                    id="email-error"
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="Enter your password"
                    className={`h-12 rounded-xl text-base pr-10 ${validationErrors.password ? 'border-2 border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-2 focus-visible:ring-2 focus-visible:ring-blue-500'}`}
                    aria-invalid={validationErrors.password ? 'true' : 'false'}
                    aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p
                    id="password-error"
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-5 px-8 pb-10">
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-2xl border-2 border-border/50 bg-muted/30 p-5 text-xs text-muted-foreground backdrop-blur-sm">
            <p className="font-semibold mb-2">Debug Info:</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
