import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Upload, X, User, FileText } from 'lucide-react'
import { profileApi, mediaApi } from '@/services/api'
import type { Profile, ProfileUpdate, MediaObject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/shared/page-header'
import LoadingSpinner from '@/components/shared/loading-spinner'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ProfileUpdate>({
    name: '',
    headline: '',
    short_bio: '',
    about: '',
    location: '',
    email: '',
    phone: '',
    resume_url: '',
    availability: true,
  })

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileApi.get()
      setProfile(data)
      setFormData({
        name: data.name,
        headline: data.headline,
        short_bio: data.short_bio,
        about: data.about,
        location: data.location,
        email: data.email,
        phone: data.phone,
        resume_url: data.resume_url,
        resume: data.resume,
        availability: data.availability,
      })
    } catch {
      // Profile doesn't exist yet, that's ok
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    try {
      const media: MediaObject = await mediaApi.upload(file, 'profile', 'Profile image')
      setFormData((prev) => ({ ...prev, profile_image: media }))
    } catch {
      setError('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }

    setIsUploading(true)
    setError('')
    try {
      const media: MediaObject = await mediaApi.upload(file, 'resume', 'Resume')
      setFormData((prev) => ({ ...prev, resume: media }))
    } catch {
      setError('Failed to upload resume')
    } finally {
      setIsUploading(false)
      if (resumeInputRef.current) resumeInputRef.current.value = ''
    }
  }

  const handleRemoveResume = async () => {
    if (formData.resume?.file_id) {
      try {
        await mediaApi.delete(formData.resume.file_id)
      } catch {
        // Ignore delete errors
      }
    }
    setFormData((prev) => ({ ...prev, resume: undefined }))
  }

  const handleRemoveImage = async () => {
    if (formData.profile_image?.file_id) {
      try {
        await mediaApi.delete(formData.profile_image.file_id)
      } catch {
        // Ignore delete errors
      }
    }
    setFormData((prev) => ({ ...prev, profile_image: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const updated = await profileApi.update(formData)
      setProfile(updated)
      setSuccess('Profile saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        setError(axiosError.response?.data?.detail || 'Failed to save profile')
      } else {
        setError('Failed to save profile')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information" />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border sm:h-24 sm:w-24">
                {formData.profile_image ? (
                  <>
                    <img
                      src={mediaApi.getUrl(formData.profile_image.file_id)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP. Max 10MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" value={formData.headline || ''} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} placeholder="e.g. Full Stack Developer" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_bio">Short Bio</Label>
              <Textarea id="short_bio" value={formData.short_bio || ''} onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })} rows={2} placeholder="A brief one-liner about yourself" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" value={formData.about || ''} onChange={(e) => setFormData({ ...formData, about: e.target.value })} rows={4} className="sm:rows-5" placeholder="Tell us more about yourself" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. San Francisco, CA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF)</Label>
              <div className="flex flex-wrap items-center gap-3">
                {formData.resume ? (
                  <>
                    <a
                      href={mediaApi.getUrl(formData.resume.file_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground hover:bg-muted/80"
                    >
                      <FileText className="h-4 w-4" />
                      {formData.resume.filename}
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="inline-flex items-center gap-1 rounded-md text-sm text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No resume uploaded</span>
                )}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload PDF'}
                </Button>
                <p className="text-xs text-muted-foreground">PDF only. Max 10MB.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="availability"
                checked={formData.availability ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, availability: checked })}
              />
              <Label htmlFor="availability" className="cursor-pointer">Available for work</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
