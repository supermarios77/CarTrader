'use client';

/**
 * Register Page - Production-ready registration form with shadcn/ui components
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
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

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

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password strength
   */
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

  /**
   * Validate phone number format (optional)
   */
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // First name validation (optional but if provided, must be valid)
    if (formData.firstName.trim() && formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    }

    // Last name validation (optional but if provided, must be valid)
    if (formData.lastName.trim() && formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    }

    // Phone validation (optional)
    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (e.g., +1234567890)';
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

    // Clear success message when user starts typing
    if (showSuccess) {
      setShowSuccess(false);
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
    setShowSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare registration data (only include non-empty optional fields)
      const registerData = {
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.firstName.trim() && { firstName: formData.firstName.trim() }),
        ...(formData.lastName.trim() && { lastName: formData.lastName.trim() }),
        ...(formData.phone.trim() && { phone: formData.phone.trim().replace(/[\s\-()]/g, '') }),
      };

      await register(registerData);

      // Show success message
      setShowSuccess(true);

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err) {
      // Error is handled by auth context
      // In production, consider sending to error tracking service
      if (process.env.NODE_ENV === 'development' && err instanceof ApiClientError) {
        // Only log in development
        // eslint-disable-next-line no-console
        console.error('Registration error:', err.message, err.statusCode);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 px-4 py-12 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              🚗 CarTrader
            </h1>
          </Link>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create your account to get started
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-zinc-200 shadow-lg dark:border-zinc-800 dark:shadow-zinc-900/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create your CarTrader account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Success Message */}
              {showSuccess && (
                <div
                  className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                  role="alert"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Account created successfully!</p>
                    <p className="text-xs mt-1">
                      A verification email has been sent to your email address.
                    </p>
                  </div>
                </div>
              )}

              {/* API Error Message */}
              {error && !showSuccess && (
                <div
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name (Optional)</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="John"
                    className={validationErrors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    aria-invalid={validationErrors.firstName ? 'true' : 'false'}
                    aria-describedby={validationErrors.firstName ? 'firstName-error' : undefined}
                  />
                  {validationErrors.firstName && (
                    <p
                      id="firstName-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name (Optional)</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="Doe"
                    className={validationErrors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    aria-invalid={validationErrors.lastName ? 'true' : 'false'}
                    aria-describedby={validationErrors.lastName ? 'lastName-error' : undefined}
                  />
                  {validationErrors.lastName && (
                    <p
                      id="lastName-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
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
                  className={validationErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  aria-invalid={validationErrors.email ? 'true' : 'false'}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                />
                {validationErrors.email && (
                  <p
                    id="email-error"
                    className="text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="+1234567890"
                  className={validationErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  aria-invalid={validationErrors.phone ? 'true' : 'false'}
                  aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
                />
                {validationErrors.phone && (
                  <p
                    id="phone-error"
                    className="text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="Create a strong password"
                  className={validationErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  aria-invalid={validationErrors.password ? 'true' : 'false'}
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                />
                {validationErrors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.password}
                  </p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="Confirm your password"
                  className={validationErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  aria-invalid={validationErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                {validationErrors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
              <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <p className="font-semibold">Debug Info:</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

