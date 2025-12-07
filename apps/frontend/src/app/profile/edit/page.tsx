'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, updateProfile, type UpdateProfileData } from '@/lib/profile-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { User, Save, ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    city: '',
    country: '',
    avatar: '',
  });

  const successTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchProfile() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const profile = await getProfile();

        if (abortController.signal.aborted) return;

        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          location: profile.location || '',
          city: profile.city || '',
          country: profile.country || '',
          avatar: profile.avatar || '',
        });
      } catch (err) {
        if (abortController.signal.aborted) return;

        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(formData);
      await refreshUser();
      setSuccess(true);
      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-white rounded-[20px] border border-[#e5e5e5]" />
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 space-y-4">
              <div className="h-6 w-48 bg-[#f5f5f5] rounded" />
              <div className="h-12 bg-[#f5f5f5] rounded-full" />
              <div className="h-12 bg-[#f5f5f5] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#111] pt-20">
      {/* Ambient Background Blobs */}
      <div className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)]" />
      <div className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4 border-[#e5e5e5] hover:bg-[#fafafa]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-[#10b981]" />
            <div>
              <h1 className="font-[var(--font-space-grotesk)] text-4xl font-semibold">Edit Profile</h1>
              <p className="mt-2 text-[#666]">Update your personal information</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-[20px] border border-[#10b981] bg-[#f0fdf4] p-4 text-sm text-[#059669]">
            Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#666]">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      maxLength={50}
                      className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#666]">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      maxLength={50}
                      className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 block text-sm font-medium text-[#666]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={authUser?.email || ''}
                    disabled
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#f5f5f5] text-base cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-[#666]">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#666]">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    maxLength={20}
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                  <p className="mt-1 text-xs text-[#666]">Format: +1234567890</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] font-semibold mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio" className="mb-2 block text-sm font-medium text-[#666]">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="w-full rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-[#666]">{formData.bio.length}/500 characters</p>
                </div>

                <div>
                  <Label htmlFor="avatar" className="mb-2 block text-sm font-medium text-[#666]">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    maxLength={500}
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                  <p className="mt-1 text-xs text-[#666]">URL to your profile picture</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <h2 className="font-[var(--font-space-grotesk)] font-semibold mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="mb-2 block text-sm font-medium text-[#666]">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown, Main Street"
                    maxLength={100}
                    className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city" className="mb-2 block text-sm font-medium text-[#666]">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Karachi"
                      maxLength={100}
                      className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="mb-2 block text-sm font-medium text-[#666]">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., Pakistan"
                      maxLength={100}
                      className="h-12 rounded-full border-[#e5e5e5] bg-[#fafafa] text-base focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="bg-[#10b981] text-white hover:bg-[#059669] h-12 px-8">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline" className="border-[#e5e5e5] hover:bg-[#fafafa] h-12 px-8">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
