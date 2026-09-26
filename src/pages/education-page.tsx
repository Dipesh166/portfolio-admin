import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'
import { educationApi } from '@/services/api'
import type { Education, EducationCreate } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface EducationFormData {
  institution: string
  degree: string
  field: string
  start_date: string
  end_date: string
  description: string
  grade: string
  location: string
  display_order: number
}

const defaultFormData: EducationFormData = {
  institution: '',
  degree: '',
  field: '',
  start_date: '',
  end_date: '',
  description: '',
  grade: '',
  location: '',
  display_order: 0,
}

export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Education | null>(null)
  const [deletingItem, setDeletingItem] = useState<Education | null>(null)
  const [formData, setFormData] = useState<EducationFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const data = await educationApi.getAll()
      setItems(data)
    } catch {
      setError('Failed to load education')
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

  const openEdit = (item: Education) => {
    setEditingItem(item)
    setFormData({
      institution: item.institution,
      degree: item.degree,
      field: item.field,
      start_date: item.start_date,
      end_date: item.end_date || '',
      description: item.description,
      grade: item.grade,
      location: item.location,
      display_order: item.display_order,
    })
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: Education) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload: EducationCreate = {
      ...formData,
      end_date: formData.end_date || undefined,
    }

    try {
      if (editingItem) {
        await educationApi.update(editingItem.id, payload)
      } else {
        await educationApi.create(payload)
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
      await educationApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete education')
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
        title="Education"
        description="Manage your educational background"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-12 w-12" />}
          title="No education yet"
          description="Add your first education entry to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {item.degree}{item.field ? ` in ${item.field}` : ''}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {item.institution}
                    {item.location && <span className="hidden sm:inline"> · {item.location}</span>}
                  </p>
                  {item.location && (
                    <p className="text-xs text-muted-foreground sm:hidden">{item.location}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.start_date)} – {item.end_date ? formatDate(item.end_date) : 'Present'}
                  </p>
                  {item.grade && (
                    <p className="text-xs text-muted-foreground">Grade: {item.grade}</p>
                  )}
                  {item.description && (
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
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
            <DialogTitle>{editingItem ? 'Edit Education' : 'Add Education'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the education details.' : 'Add a new education entry.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" value={formData.degree} onChange={(e) => setFormData({ ...formData, degree: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field of Study</Label>
                <Input id="field" value={formData.field} onChange={(e) => setFormData({ ...formData, field: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="month" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="month" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input id="grade" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="e.g. 3.8/4.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
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
        title="Delete Education"
        description={`Are you sure you want to delete "${deletingItem?.degree} at ${deletingItem?.institution}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
