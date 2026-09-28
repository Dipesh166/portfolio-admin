import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Music2, Upload, X, Trash2, ImagePlus } from 'lucide-react'
import { musicApi, mediaApi } from '@/services/api'
import type { MusicTrack, MusicCreate, MediaObject } from '@/types'
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

interface MusicFormData {
  title: string
  artist: string
  display_order: number
  enabled: boolean
}

const defaultFormData: MusicFormData = {
  title: '',
  artist: '',
  display_order: 0,
  enabled: true,
}

function AudioUpload({ audio, onUpload, onRemove }: { audio?: MediaObject; onUpload: (file: File) => Promise<void>; onRemove: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleChange} className="hidden" />
      {audio ? (
        <div className="space-y-2">
          <audio controls preload="none" src={mediaApi.getUrl(audio.file_id)} className="w-full" />
          <div className="flex items-center gap-2">
            <p className="flex-1 truncate text-xs text-muted-foreground">{audio.filename}</p>
            <Button type="button" variant="outline" size="sm" onClick={onRemove}>
              <X className="mr-1 h-3 w-3" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-full flex-col items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted/50"
        >
          <Upload className="mb-1 h-6 w-6" />
          <span className="text-xs">{uploading ? 'Uploading...' : 'Upload MP3 / Audio'}</span>
        </button>
      )}
    </div>
  )
}

function CoverImageUpload({ image, onUpload, onRemove }: { image?: MediaObject; onUpload: (file: File) => Promise<void>; onRemove: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      {image ? (
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border">
          <img src={mediaApi.getUrl(image.file_id)} alt="Cover" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-110"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-110"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Upload Cover Image'}</span>
        </button>
      )}
    </div>
  )
}

export default function MusicPage() {
  const [items, setItems] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MusicTrack | null>(null)
  const [deletingItem, setDeletingItem] = useState<MusicTrack | null>(null)
  const [formData, setFormData] = useState<MusicFormData>(defaultFormData)
  const [audio, setAudio] = useState<MediaObject | undefined>()
  const [coverImage, setCoverImage] = useState<MediaObject | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const data = await musicApi.getAll()
      setItems(data)
    } catch {
      setError('Failed to load music tracks')
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
    setAudio(undefined)
    setCoverImage(undefined)
    setError('')
    setIsFormOpen(true)
  }

  const openEdit = (item: MusicTrack) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      artist: item.artist,
      display_order: item.display_order,
      enabled: item.enabled,
    })
    setAudio(item.audio)
    setCoverImage(item.cover_image)
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: MusicTrack) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleAudioUpload = async (file: File) => {
    const media = await mediaApi.upload(file, 'music', formData.title)
    setAudio(media)
  }

  const handleCoverUpload = async (file: File) => {
    const media = await mediaApi.upload(file, 'music', `${formData.title || 'Track'} cover`)
    setCoverImage(media)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload: MusicCreate = {
      ...formData,
      audio,
      cover_image: coverImage,
    }

    try {
      if (editingItem) {
        await musicApi.update(editingItem.id, payload)
      } else {
        await musicApi.create(payload)
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
      await musicApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete music track')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleEnabled = async (item: MusicTrack) => {
    try {
      await musicApi.update(item.id, { enabled: !item.enabled })
      await fetchData()
    } catch {
      setError('Failed to update music track')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Music"
        description="Manage your music tracks and audio"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Track
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Music2 className="h-12 w-12" />}
          title="No music tracks yet"
          description="Add your first music track to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Track
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3 sm:p-4">
              {item.cover_image ? (
                <img
                  src={mediaApi.getUrl(item.cover_image.file_id)}
                  alt={item.title}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-border sm:h-16 sm:w-16"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 via-primary/10 to-muted ring-1 ring-border sm:h-16 sm:w-16">
                  <Music2 className="h-6 w-6 text-primary/70" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-medium text-foreground">{item.title}</h3>
                  {!item.enabled && <Badge variant="outline" className="text-[10px]">Disabled</Badge>}
                </div>
                {item.artist && <p className="text-xs text-muted-foreground">{item.artist}</p>}
                {item.audio && (
                  <audio controls preload="none" src={mediaApi.getUrl(item.audio.file_id)} className="h-9 w-full max-w-sm min-w-0" />
                )}
              </div>
              <Switch
                checked={item.enabled}
                onCheckedChange={() => toggleEnabled(item)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" className="shrink-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
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
        <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Track' : 'Add Track'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the music track details.' : 'Add a new music track to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. My Awesome Track" required />
            </div>
            <div className="space-y-2">
              <Label>Artist</Label>
              <Input value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })} placeholder="e.g. Your Name" />
            </div>
            <div className="space-y-2">
              <Label>Audio File</Label>
              <AudioUpload audio={audio} onUpload={handleAudioUpload} onRemove={() => setAudio(undefined)} />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <CoverImageUpload image={coverImage} onUpload={handleCoverUpload} onRemove={() => setCoverImage(undefined)} />
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
        title="Delete Track"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}