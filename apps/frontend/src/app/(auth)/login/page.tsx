'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ApiClientError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof newErrors];
        return newErrors;
      });
    }

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearError();
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      router.push('/');
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === 'development' && err instanceof ApiClientError) {
        // Error handled by auth context
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

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
          <p className="text-base text-[#666]">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] border border-[#e5e5e5] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-6">
            <h2 className="font-[var(--font-space-grotesk)] text-3xl font-semibold">Welcome back</h2>
            <p className="text-base text-[#666]">Enter your email and password to sign in</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* API Error Message */}
              {error && (
                <div
                  className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
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
                  className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                    validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-invalid={validationErrors.email ? 'true' : 'false'}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-sm font-medium text-red-600" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#10b981] hover:text-[#059669] transition-colors"
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
                    className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base pr-10 focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                      validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    aria-invalid={validationErrors.password ? 'true' : 'false'}
                    aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-black transition-colors focus:outline-none rounded-md p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p id="password-error" className="text-sm font-medium text-red-600" role="alert">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isFormDisabled}
                className="w-full h-12 rounded-full bg-[#111] text-white hover:bg-[#222] text-base font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all"
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
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[#666]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#10b981] hover:text-[#059669] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
