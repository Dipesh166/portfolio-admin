import { useState, useEffect, useCallback } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import { settingsApi } from '@/services/api'
import type { SiteSettings, SiteSettingsUpdate } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/shared/page-header'
import LoadingSpinner from '@/components/shared/loading-spinner'

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [siteName, setSiteName] = useState('')
  const [siteTagline, setSiteTagline] = useState('')
  const [footerText, setFooterText] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [gaId, setGaId] = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsApi.get()
      setSettings(data)
      setSiteName(data.site_name)
      setSiteTagline(data.site_tagline)
      setFooterText(data.footer_text)
      setMaintenanceMode(data.maintenance_mode)
      setSeoTitle(data.seo?.meta_title || '')
      setSeoDescription(data.seo?.meta_description || '')
      setOgImage(data.seo?.og_image || '')
      setSiteUrl(data.seo?.site_url || '')
      setGaId(data.seo?.google_analytics_id || '')
    } catch {
      // Settings don't exist yet
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    const payload: SiteSettingsUpdate = {
      site_name: siteName,
      site_tagline: siteTagline,
      footer_text: footerText,
      maintenance_mode: maintenanceMode,
      seo: {
        meta_title: seoTitle,
        meta_description: seoDescription,
        og_image: ogImage,
        site_url: siteUrl,
        google_analytics_id: gaId,
      },
    }

    try {
      const updated = await settingsApi.update(payload)
      setSettings(updated)
      setSuccess('Settings saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        setError(axiosError.response?.data?.detail || 'Failed to save settings')
      } else {
        setError('Failed to save settings')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your site configuration" />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic site branding and content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="My Portfolio" />
                </div>
                <div className="space-y-2">
                  <Label>Site Tagline</Label>
                  <Input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="Building the future" />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} rows={2} placeholder="© 2024 My Portfolio" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Control site availability.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Switch id="maintenance" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  <div>
                    <Label htmlFor="maintenance" className="cursor-pointer text-sm font-medium">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">When enabled, visitors see a maintenance page.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine optimization settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Portfolio - Full Stack Developer" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} placeholder="A brief description for search engines" />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/og-image.png" />
                </div>
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://myportfolio.com" />
                </div>
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
