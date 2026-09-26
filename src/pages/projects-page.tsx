import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, FolderKanban, ExternalLink, Upload, X, Star, Code2 } from 'lucide-react'
import { projectApi, mediaApi } from '@/services/api'
import type { Project, ProjectCreate, MediaObject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface ProjectFormData {
  title: string
  slug: string
  short_description: string
  description: string
  technologies: string[]
  github_url: string
  live_url: string
  featured: boolean
  status: 'completed' | 'in_progress' | 'planned'
  display_order: number
}

const defaultFormData: ProjectFormData = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  technologies: [],
  github_url: '',
  live_url: '',
  featured: false,
  status: 'completed',
  display_order: 0,
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

function ImageUpload({ label, image, onUpload, onRemove }: { label: string; image?: MediaObject; onUpload: (file: File) => Promise<void>; onRemove: () => void }) {
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
      <Label>{label}</Label>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      {image ? (
        <div className="relative inline-block">
          <img src={mediaApi.getUrl(image.file_id)} alt={label} className="h-24 w-24 rounded-md border border-border object-cover" />
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Project | null>(null)
  const [deletingItem, setDeletingItem] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData)
  const [thumbnail, setThumbnail] = useState<MediaObject | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const data = await projectApi.getAll()
      setProjects(data)
    } catch {
      setError('Failed to load projects')
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
    setThumbnail(undefined)
    setError('')
    setIsFormOpen(true)
  }

  const openEdit = (item: Project) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      slug: item.slug,
      short_description: item.short_description,
      description: item.description,
      technologies: item.technologies || [],
      github_url: item.github_url,
      live_url: item.live_url,
      featured: item.featured,
      status: item.status,
      display_order: item.display_order,
    })
    setThumbnail(item.thumbnail)
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: Project) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleThumbnailUpload = async (file: File) => {
    const media = await mediaApi.upload(file, 'projects', formData.title)
    setThumbnail(media)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload: ProjectCreate = {
      ...formData,
      thumbnail,
    }

    try {
      if (editingItem) {
        await projectApi.update(editingItem.id, payload)
      } else {
        await projectApi.create(payload)
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
      await projectApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
    completed: 'default',
    in_progress: 'secondary',
    planned: 'outline',
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No projects yet"
          description="Add your first project to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                {item.thumbnail && (
                  <img
                    src={mediaApi.getUrl(item.thumbnail.file_id)}
                    alt={item.title}
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{item.title}</h3>
                    {item.featured && <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.short_description}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={statusColors[item.status] || 'outline'} className="text-[10px]">
                      {item.status.replace('_', ' ')}
                    </Badge>
                    {item.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-[10px]">
                        {tech}
                      </Badge>
                    ))}
                    {item.technologies.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{item.technologies.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="shrink-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                    {item.github_url && (
                      <DropdownMenuItem asChild>
                        <a href={item.github_url} target="_blank" rel="noopener noreferrer">
                          <Code2 className="mr-2 h-4 w-4" /> GitHub
                        </a>
                      </DropdownMenuItem>
                    )}
                    {item.live_url && (
                      <DropdownMenuItem asChild>
                        <a href={item.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                        </a>
                      </DropdownMenuItem>
                    )}
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
            <DialogTitle>{editingItem ? 'Edit Project' : 'Add Project'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the project details.' : 'Add a new project to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value
                  setFormData({
                    ...formData,
                    title,
                    slug: editingItem ? formData.slug : slugify(title),
                  })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <ImageUpload
                label="Thumbnail"
                image={thumbnail}
                onUpload={handleThumbnailUpload}
                onRemove={() => setThumbnail(undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <TagInput tags={formData.technologies} onChange={(technologies) => setFormData({ ...formData, technologies })} placeholder="Add technology" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input type="url" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input type="url" value={formData.live_url} onChange={(e) => setFormData({ ...formData, live_url: e.target.value })} placeholder="https://" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as Project['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-0.5">
                <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} />
                <Label htmlFor="featured" className="cursor-pointer text-sm">Featured project</Label>
              </div>
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
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
