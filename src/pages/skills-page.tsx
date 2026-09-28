import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Code2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { skillApi, mediaApi } from '@/services/api'
import type { Skill, SkillCreate, MediaObject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PageHeader from '@/components/shared/page-header'
import LoadingSpinner from '@/components/shared/loading-spinner'
import EmptyState from '@/components/shared/empty-state'
import ConfirmDialog from '@/components/shared/confirm-dialog'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

interface SkillFormData {
  name: string
  category: string
  level: Skill['level']
  icon: string
  image?: MediaObject
  display_order: number
}

const defaultFormData: SkillFormData = {
  name: '',
  category: '',
  level: 'Intermediate',
  icon: '',
  image: undefined,
  display_order: 0,
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null)
  const [formData, setFormData] = useState<SkillFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const fetchSkills = useCallback(async () => {
    try {
      const data = await skillApi.getAll()
      setSkills(data)
    } catch {
      setError('Failed to load skills')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const openCreate = () => {
    setEditingSkill(null)
    setFormData(defaultFormData)
    setError('')
    setIsFormOpen(true)
  }

  const openEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon,
      image: skill.image,
      display_order: skill.display_order,
    })
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (skill: Skill) => {
    setDeletingSkill(skill)
    setIsDeleteOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    try {
      const media: MediaObject = await mediaApi.upload(file, 'skills', 'Skill image')
      setFormData((prev) => ({ ...prev, image: media }))
    } catch {
      setError('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleRemoveImage = async () => {
    if (formData.image?.file_id) {
      try {
        await mediaApi.delete(formData.image.file_id)
      } catch {
        // Ignore delete errors
      }
    }
    setFormData((prev) => ({ ...prev, image: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (editingSkill) {
        await skillApi.update(editingSkill.id, formData)
      } else {
        await skillApi.create(formData as SkillCreate)
      }
      setIsFormOpen(false)
      await fetchSkills()
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
    if (!deletingSkill) return
    setIsSubmitting(true)
    try {
      await skillApi.delete(deletingSkill.id)
      setIsDeleteOpen(false)
      setDeletingSkill(null)
      await fetchSkills()
    } catch {
      setError('Failed to delete skill')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [...new Set(skills.map((s) => s.category))]

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Manage your technical skills"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {skills.length === 0 ? (
        <EmptyState
          icon={<Code2 className="h-12 w-12" />}
          title="No skills yet"
          description="Add your first skill to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>

              <div className="hidden sm:block rounded-lg border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Skill</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Level</th>
                        <th className="px-4 py-2 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {skills
                        .filter((s) => s.category === category)
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((skill) => (
                          <tr key={skill.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {skill.image ? (
                                  <img
                                    src={mediaApi.getUrl(skill.image.file_id)}
                                    alt={skill.image.alt || skill.name}
                                    className="h-6 w-6 shrink-0 rounded object-cover"
                                  />
                                ) : skill.icon ? (
                                  <img src={skill.icon} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
                                ) : null}
                                <span className="font-medium">{skill.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  skill.level === 'Expert'
                                    ? 'default'
                                    : skill.level === 'Advanced'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {skill.level}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button variant="ghost" size="icon-sm">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEdit(skill)}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => openDelete(skill)}>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 sm:hidden">
                {skills
                  .filter((s) => s.category === category)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2.5 space-y-0">
                        {skill.image ? (
                          <img
                            src={mediaApi.getUrl(skill.image.file_id)}
                            alt={skill.image.alt || skill.name}
                            className="h-8 w-8 shrink-0 rounded object-cover"
                          />
                        ) : skill.icon ? (
                          <img src={skill.icon} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                        ) : null}
                        <div className="space-y-1">
                          <span className="font-medium text-sm">{skill.name}</span>
                          <div>
                            <Badge
                              variant={
                                skill.level === 'Expert'
                                  ? 'default'
                                  : skill.level === 'Advanced'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {skill.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(skill)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openDelete(skill)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
            <DialogDescription>
              {editingSkill ? 'Update the skill details.' : 'Add a new skill to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. React"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Frontend"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={formData.level}
                onValueChange={(val) => setFormData({ ...formData, level: val as Skill['level'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon URL (optional)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g. https://img.icons8.com/.../react.png"
              />
            </div>
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {formData.image ? (
                    <img
                      src={mediaApi.getUrl(formData.image.file_id)}
                      alt={formData.image.alt || 'Skill image'}
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
                {formData.image ? (
                  <Button type="button" variant="outline" onClick={handleRemoveImage} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 10MB.</p>
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Saving...' : editingSkill ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Skill"
        description={`Are you sure you want to delete "${deletingSkill?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}