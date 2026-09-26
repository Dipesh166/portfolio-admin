import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react'
import { achievementApi } from '@/services/api'
import type { Achievement, AchievementCreate } from '@/types'
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

interface AchievementFormData {
  title: string
  description: string
  date: string
  url: string
  icon: string
  display_order: number
}

const defaultFormData: AchievementFormData = {
  title: '',
  description: '',
  date: '',
  url: '',
  icon: '',
  display_order: 0,
}

export default function AchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Achievement | null>(null)
  const [deletingItem, setDeletingItem] = useState<Achievement | null>(null)
  const [formData, setFormData] = useState<AchievementFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const data = await achievementApi.getAll()
      setItems(data)
    } catch {
      setError('Failed to load achievements')
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

  const openEdit = (item: Achievement) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      url: item.url,
      icon: item.icon,
      display_order: item.display_order,
    })
    setError('')
    setIsFormOpen(true)
  }

  const openDelete = (item: Achievement) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (editingItem) {
        await achievementApi.update(editingItem.id, formData as AchievementCreate)
      } else {
        await achievementApi.create(formData as AchievementCreate)
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
      await achievementApi.delete(deletingItem.id)
      setIsDeleteOpen(false)
      setDeletingItem(null)
      await fetchData()
    } catch {
      setError('Failed to delete achievement')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Manage your achievements and awards"
        action={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Achievement
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-12 w-12" />}
          title="No achievements yet"
          description="Add your first achievement to get started."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3 sm:p-4">
              {item.icon ? (
                <span className="text-2xl">{item.icon}</span>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{item.title}</h3>
                {item.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {item.date && <span>{item.date}</span>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Link
                    </a>
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
                  <DropdownMenuItem className="text-destructive" onClick={() => openDelete(item)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Achievement' : 'Add Achievement'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the achievement details.' : 'Add a new achievement.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} placeholder="e.g. Jan 2024" />
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g. 🏆" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://" />
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
        title="Delete Achievement"
        description={`Are you sure you want to delete "${deletingItem?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
