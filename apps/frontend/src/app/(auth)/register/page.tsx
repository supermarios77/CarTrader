'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ApiClientError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.firstName.trim() && formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    }

    if (formData.lastName.trim() && formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    }

    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (e.g., +1234567890)';
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

    if (showSuccess) {
      setShowSuccess(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearError();
    setValidationErrors({});
    setShowSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registerData = {
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.firstName.trim() && { firstName: formData.firstName.trim() }),
        ...(formData.lastName.trim() && { lastName: formData.lastName.trim() }),
        ...(formData.phone.trim() && { phone: formData.phone.trim().replace(/[\s\-()]/g, '') }),
      };

      await register(registerData);

      setShowSuccess(true);

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
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
          <p className="text-base text-[#666]">Create your account to get started</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[40px] border border-[#e5e5e5] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-6">
            <h2 className="font-[var(--font-space-grotesk)] text-3xl font-semibold">Create an account</h2>
            <p className="text-base text-[#666]">Enter your information to create your CarTrader account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Success Message */}
              {showSuccess && (
                <div
                  className="flex items-start gap-3 rounded-xl border border-[#10b981] bg-[#f0fdf4] p-4 text-sm text-[#059669]"
                  role="alert"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Account created successfully!</p>
                    <p className="text-xs mt-1.5">
                      A verification email has been sent to your email address.
                    </p>
                  </div>
                </div>
              )}

              {/* API Error Message */}
              {error && !showSuccess && (
                <div
                  className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-base font-medium">
                    First Name (Optional)
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="John"
                    className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                      validationErrors.firstName ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    aria-invalid={validationErrors.firstName ? 'true' : 'false'}
                  />
                  {validationErrors.firstName && (
                    <p id="firstName-error" className="text-sm font-medium text-red-600" role="alert">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-base font-medium">
                    Last Name (Optional)
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="Doe"
                    className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                      validationErrors.lastName ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    aria-invalid={validationErrors.lastName ? 'true' : 'false'}
                  />
                  {validationErrors.lastName && (
                    <p id="lastName-error" className="text-sm font-medium text-red-600" role="alert">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address *
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
                    validationErrors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={validationErrors.email ? 'true' : 'false'}
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-sm font-medium text-red-600" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="+1234567890"
                  className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                    validationErrors.phone ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  aria-invalid={validationErrors.phone ? 'true' : 'false'}
                />
                {validationErrors.phone && (
                  <p id="phone-error" className="text-sm font-medium text-red-600" role="alert">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="Create a strong password"
                    className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base pr-10 focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                      validationErrors.password ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    aria-invalid={validationErrors.password ? 'true' : 'false'}
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
                <p className="text-xs text-[#666]">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="Confirm your password"
                    className={`h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base pr-10 focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] ${
                      validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    aria-invalid={validationErrors.confirmPassword ? 'true' : 'false'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-black transition-colors focus:outline-none rounded-md p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm font-medium text-red-600" role="alert">
                    {validationErrors.confirmPassword}
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[#666]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#10b981] hover:text-[#059669] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
