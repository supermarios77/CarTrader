'use client';

/**
 * Register Page - Production-ready registration form with shadcn/ui components
 */

import { useState, FormEvent, useEffect, useRef } from 'react';
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

  // Cleanup redirect timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

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
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err) {
      // Error is handled by auth context
      // In production, consider sending to error tracking service
      if (process.env.NODE_ENV === 'development' && err instanceof ApiClientError) {
        // Only log in development
        // eslint-disable-next-line no-console
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
            Create your account to get started
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-2 rounded-3xl shadow-xl dark:shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 px-8 pt-10 pb-6">
            <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
            <CardDescription className="text-base">
              Enter your information to create your CarTrader account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-8">
              {/* Success Message */}
              {showSuccess && (
                <div
                  className="flex items-start gap-3 rounded-2xl border-2 border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400"
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
                  className="flex items-center gap-3 rounded-2xl border-2 border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-base font-medium">First Name (Optional)</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="John"
                    className={`h-12 rounded-xl text-base ${validationErrors.firstName ? 'border-2 border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-2 focus-visible:ring-2 focus-visible:ring-blue-500'}`}
                    aria-invalid={validationErrors.firstName ? 'true' : 'false'}
                    aria-describedby={validationErrors.firstName ? 'firstName-error' : undefined}
                  />
                  {validationErrors.firstName && (
                    <p
                      id="firstName-error"
                      className="text-sm font-medium text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-base font-medium">Last Name (Optional)</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    placeholder="Doe"
                    className={`h-12 rounded-xl text-base ${validationErrors.lastName ? 'border-2 border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-2 focus-visible:ring-2 focus-visible:ring-blue-500'}`}
                    aria-invalid={validationErrors.lastName ? 'true' : 'false'}
                    aria-describedby={validationErrors.lastName ? 'lastName-error' : undefined}
                  />
                  {validationErrors.lastName && (
                    <p
                      id="lastName-error"
                      className="text-sm font-medium text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
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

              {/* Phone Field */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-medium">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  placeholder="+1234567890"
                  className={`h-12 rounded-xl text-base ${validationErrors.phone ? 'border-2 border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-2 focus-visible:ring-2 focus-visible:ring-blue-500'}`}
                  aria-invalid={validationErrors.phone ? 'true' : 'false'}
                  aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
                />
                {validationErrors.phone && (
                  <p
                    id="phone-error"
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium">Password *</Label>
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
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password *</Label>
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
                    className={`h-12 rounded-xl text-base pr-10 ${validationErrors.confirmPassword ? 'border-2 border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-2 focus-visible:ring-2 focus-visible:ring-blue-500'}`}
                    aria-invalid={validationErrors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {validationErrors.confirmPassword}
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
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

