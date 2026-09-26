import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Award, Upload, X, ExternalLink } from 'lucide-react'
import { certificationApi, mediaApi } from '@/services/api'
import type { Certification, CertificationCreate, MediaObject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface CertFormData {
  title: string
  issuer: string
  issue_date: string
  credential_id: string
  credential_url: string
  display_order: number
}

const defaultFormData: CertFormData = {
  title: '',
  issuer: '',
  issue_date: '',
  credential_id: '',
  credential_url: '',
  display_order: 0,
}

function ImageUpload({ image, onUpload, onRemove }: { image?: MediaObject; onUpload: (file: File) => Promise<void>; onRemove: () => void }) {
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
        <div className="relative inline-block">
          <img src={mediaApi.getUrl(image.file_id)} alt="Certificate" className="h-24 w-24 rounded-md border border-border object-cover" />
          <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted/50"
        >
          <Upload className="h-6 w-6 mb-1" />
          <span className="text-xs">{uploading ? '...' : 'Upload'}</span>
        </button>
      )}
    </div>
  )
}

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Certification | null>(null)
  const [deletingItem, setDeletingItem] = useState<Certification | null>(null)
  const [formData, setFormData] = useState<CertFormData>(defaultFormData)
  const [certImage, setCertImage] = useState<MediaObject | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const data = await certificationApi.getAll()
      setItems(data)
    } catch {
      setError('Failed to load certifications')
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
    setCertImage(undefined)
    setError('')
    setIsFormOpen(true)
  }

  const openEdit = (item: Certification) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      issuer: item.issuer,
      issue_date: item.issue_date,
      credential_id: item.credential_id,
      credential_url: item.credential_url,
      display_order: item.display_order,
    })
    setCertImage(item.certificate_image)
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: Certification) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleImageUpload = async (file: File) => {
    const media = await mediaApi.upload(file, 'certifications', formData.title)
    setCertImage(media)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload: CertificationCreate = {
      ...formData,
      certificate_image: certImage,
    }

    try {
      if (editingItem) {
        await certificationApi.update(editingItem.id, payload)
      } else {
        await certificationApi.create(payload)
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
      await certificationApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete certification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const [year, month] = date.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications"
        description="Manage your professional certifications"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Award className="h-12 w-12" />}
          title="No certifications yet"
          description="Add your first certification to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3 sm:p-4">
              {item.certificate_image ? (
                <img src={mediaApi.getUrl(item.certificate_image.file_id)} alt={item.title} className="h-14 w-14 shrink-0 rounded-md object-cover sm:h-16 sm:w-16" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted sm:h-16 sm:w-16">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.issuer}</p>
                <p className="text-xs text-muted-foreground">{formatDate(item.issue_date)}</p>
                {item.credential_url && (
                  <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    View Credential <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
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
        <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the certification details.' : 'Add a new certification.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Issuer</Label>
              <Input value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="month" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Credential ID</Label>
              <Input value={formData.credential_id} onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Credential URL</Label>
              <Input type="url" value={formData.credential_url} onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label>Certificate Image</Label>
              <ImageUpload image={certImage} onUpload={handleImageUpload} onRemove={() => setCertImage(undefined)} />
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
        title="Delete Certification"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
