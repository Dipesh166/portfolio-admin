import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Briefcase, X } from 'lucide-react'
import { experienceApi } from '@/services/api'
import type { Experience, ExperienceCreate } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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

interface ExperienceFormData {
  company: string
  position: string
  employment_type: string
  location: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
  technologies: string[]
  company_url: string
  display_order: number
}

const defaultFormData: ExperienceFormData = {
  company: '',
  position: '',
  employment_type: 'Full-time',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
  technologies: [],
  company_url: '',
  display_order: 0,
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-input bg-transparent px-2 py-1.5 min-h-9 focus-within:ring-1 focus-within:ring-ring">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? (placeholder || 'Type and press Enter') : ''}
        className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Experience | null>(null)
  const [deletingItem, setDeletingItem] = useState<Experience | null>(null)
  const [formData, setFormData] = useState<ExperienceFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const data = await experienceApi.getAll()
      setExperiences(data)
    } catch {
      setError('Failed to load experiences')
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

  const openEdit = (item: Experience) => {
    setEditingItem(item)
    setFormData({
      company: item.company,
      position: item.position,
      employment_type: item.employment_type,
      location: item.location,
      start_date: item.start_date,
      end_date: item.end_date || '',
      is_current: item.is_current,
      description: item.description,
      technologies: item.technologies || [],
      company_url: item.company_url,
      display_order: item.display_order,
    })
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: Experience) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload: ExperienceCreate = {
      ...formData,
      end_date: formData.is_current ? undefined : formData.end_date || undefined,
    }

    try {
      if (editingItem) {
        await experienceApi.update(editingItem.id, payload)
      } else {
        await experienceApi.create(payload)
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
      await experienceApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete experience')
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
        title="Experience"
        description="Manage your work experience"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {experiences.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-12 w-12" />}
          title="No experience yet"
          description="Add your first work experience to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {experiences.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{item.position}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {item.company}
                    {item.location && <span className="hidden sm:inline"> · {item.location}</span>}
                  </p>
                  {item.location && (
                    <p className="text-xs text-muted-foreground sm:hidden">{item.location}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.start_date)} – {item.is_current ? 'Present' : formatDate(item.end_date || '')}
                  </p>
                  {item.description && (
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-[10px] sm:text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
                    <DropdownMenuItem className="text-destructive" onClick={() => openDelete(item)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the experience details.' : 'Add a new work experience.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Input id="employment_type" value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="month" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="month" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} disabled={formData.is_current} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="is_current" checked={formData.is_current} onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked, end_date: checked ? '' : formData.end_date })} />
              <Label htmlFor="is_current" className="cursor-pointer text-sm">Currently working here</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_url">Company URL</Label>
              <Input id="company_url" type="url" value={formData.company_url} onChange={(e) => setFormData({ ...formData, company_url: e.target.value })} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <TagInput tags={formData.technologies} onChange={(technologies) => setFormData({ ...formData, technologies })} placeholder="Add technology" />
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
        title="Delete Experience"
        description={`Are you sure you want to delete "${deletingItem?.position} at ${deletingItem?.company}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
