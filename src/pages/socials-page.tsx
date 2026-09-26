import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Share2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { socialApi, mediaApi } from '@/services/api'
import type { SocialLink, SocialLinkCreate, MediaObject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader from '@/components/shared/page-header'
import LoadingSpinner from '@/components/shared/loading-spinner'
import EmptyState from '@/components/shared/empty-state'
import ConfirmDialog from '@/components/shared/confirm-dialog'

interface SocialFormData {
  platform: string
  url: string
  icon: string
  display_order: number
  enabled: boolean
}

const defaultFormData: SocialFormData = {
  platform: '',
  url: '',
  icon: '',
  display_order: 0,
  enabled: true,
}

const resolveIconUrl = (icon: string): string => {
  if (!icon) return ''
  if (/^https?:\/\//i.test(icon)) return icon
  const fileId = icon.split('/').pop()
  return fileId && /^[0-9a-fA-F]{24}$/.test(fileId) ? mediaApi.getUrl(fileId) : icon
}

const getFileIdFromUrl = (url: string): string => {
  const fileId = url.split('/').pop() ?? ''
  return /^[0-9a-fA-F]{24}$/.test(fileId) ? fileId : ''
}

export default function SocialsPage() {
  const [items, setItems] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null)
  const [deletingItem, setDeletingItem] = useState<SocialLink | null>(null)
  const [formData, setFormData] = useState<SocialFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await socialApi.getAll()
      setItems(data)
    } catch {
      setError('Failed to load social links')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () => {
    setEditingItem(null)
    setFormData(defaultFormData)
    setError('')
    setIsFormOpen(true)
  }

  const openEdit = (item: SocialLink) => {
    setEditingItem(item)
    setFormData({
      platform: item.platform,
      url: item.url,
      icon: item.icon,
      display_order: item.display_order,
      enabled: item.enabled,
    })
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: SocialLink) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    try {
      const media: MediaObject = await mediaApi.upload(file, 'socials', 'Social media icon')
      setFormData((prev) => ({ ...prev, icon: media.url }))
    } catch {
      setError('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleRemoveIcon = async () => {
    const fileId = getFileIdFromUrl(formData.icon)
    if (fileId) {
      try {
        await mediaApi.delete(fileId)
      } catch {
        // Ignore delete errors
      }
    }
    setFormData((prev) => ({ ...prev, icon: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (editingItem) {
        await socialApi.update(editingItem.id, formData as SocialLinkCreate)
      } else {
        await socialApi.create(formData as SocialLinkCreate)
      }
      setIsFormOpen(false)
      await fetchData()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } }
        setError(axiosError.response?.data?.detail || 'Operation failed')
      } else {
        setError('Operation failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setIsSubmitting(true)
    try {
      await socialApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete social link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleEnabled = async (item: SocialLink) => {
    try {
      await socialApi.update(item.id, { enabled: !item.enabled })
      await fetchData()
    } catch {
      setError('Failed to update social link')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Links"
        description="Manage your social media links"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Social Link
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Share2 className="h-12 w-12" />}
          title="No social links yet"
          description="Add your first social link to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3 sm:p-4">
              {item.icon ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  <img
                    src={resolveIconUrl(item.icon)}
                    alt={item.platform}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground text-sm">{item.platform}</h3>
                  {!item.enabled && <Badge variant="outline" className="text-[10px]">Disabled</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.url}</p>
              </div>
              <Switch
                checked={item.enabled}
                onCheckedChange={() => toggleEnabled(item)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="shrink-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => openDelete(item)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the social link details.' : 'Add a new social media link.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Input value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} placeholder="e.g. GitHub, LinkedIn" required />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://" required />
            </div>
            <div className="space-y-2">
              <Label>Icon Image</Label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {formData.icon ? (
                    <img
                      src={resolveIconUrl(formData.icon)}
                      alt="Social icon"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {formData.icon ? (
                  <Button type="button" variant="outline" onClick={handleRemoveIcon} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()} disabled={isUploading} className="w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.enabled} onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })} />
              <Label className="cursor-pointer text-sm">Enabled</Label>
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">{isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Social Link"
        description={`Are you sure you want to delete "${deletingItem?.platform}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
