'use client';

/**
 * Edit Profile Page
 * Allows users to update their profile information
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, updateProfile, type UpdateProfileData } from '@/lib/profile-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch profile data
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchProfile() {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const profile = await getProfile();

        // Don't update state if request was aborted
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
        // Don't update state if request was aborted
        if (abortController.signal.aborted) return;

        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    // Cleanup: abort request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated]);

  // Cleanup timeout on unmount
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear success message when user starts typing
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Clear previous timeout if exists
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    try {
      // Build update data - send null for empty strings to clear fields
      const updateData: UpdateProfileData = {};
      
      // Trim and process each field
      const trimmedFirstName = formData.firstName?.trim();
      if (trimmedFirstName !== undefined && trimmedFirstName !== '') {
        updateData.firstName = trimmedFirstName;
      } else if (trimmedFirstName === '') {
        updateData.firstName = null;
      }

      const trimmedLastName = formData.lastName?.trim();
      if (trimmedLastName !== undefined && trimmedLastName !== '') {
        updateData.lastName = trimmedLastName;
      } else if (trimmedLastName === '') {
        updateData.lastName = null;
      }

      const trimmedPhone = formData.phone?.trim();
      if (trimmedPhone !== undefined && trimmedPhone !== '') {
        updateData.phone = trimmedPhone;
      } else if (trimmedPhone === '') {
        updateData.phone = null;
      }

      const trimmedBio = formData.bio?.trim();
      if (trimmedBio !== undefined && trimmedBio !== '') {
        updateData.bio = trimmedBio;
      } else if (trimmedBio === '') {
        updateData.bio = null;
      }

      const trimmedLocation = formData.location?.trim();
      if (trimmedLocation !== undefined && trimmedLocation !== '') {
        updateData.location = trimmedLocation;
      } else if (trimmedLocation === '') {
        updateData.location = null;
      }

      const trimmedCity = formData.city?.trim();
      if (trimmedCity !== undefined && trimmedCity !== '') {
        updateData.city = trimmedCity;
      } else if (trimmedCity === '') {
        updateData.city = null;
      }

      const trimmedCountry = formData.country?.trim();
      if (trimmedCountry !== undefined && trimmedCountry !== '') {
        updateData.country = trimmedCountry;
      } else if (trimmedCountry === '') {
        updateData.country = null;
      }

      const trimmedAvatar = formData.avatar?.trim();
      if (trimmedAvatar !== undefined && trimmedAvatar !== '') {
        updateData.avatar = trimmedAvatar;
      } else if (trimmedAvatar === '') {
        updateData.avatar = null;
      }

      const updatedProfile = await updateProfile(updateData);
      
      // Refresh auth context with updated user data
      await refreshUser();
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false);
        successTimeoutRef.current = null;
      }, 3000);
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
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded" />
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Edit Profile</h1>
              <p className="mt-2 text-muted-foreground">
                Update your personal information
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-green-500/50 bg-green-500/10">
            <CardContent className="pt-6">
              <p className="text-green-600 dark:text-green-400">
                Profile updated successfully!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authUser?.email || ''}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    maxLength={20}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Format: +1234567890
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL to your profile picture
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown, Main Street"
                    maxLength={100}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Karachi"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., Pakistan"
                      maxLength={100}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline" size="lg">
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

