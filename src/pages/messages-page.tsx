import { useState, useEffect, useCallback } from 'react'
import { Trash2, MessageSquare, Mail, MailOpen } from 'lucide-react'
import { messageApi } from '@/services/api'
import type { ContactMessage } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PageHeader from '@/components/shared/page-header'
import LoadingSpinner from '@/components/shared/loading-spinner'
import EmptyState from '@/components/shared/empty-state'
import ConfirmDialog from '@/components/shared/confirm-dialog'

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchData = useCallback(async () => {
    try {
      const [data, unread] = await Promise.all([
        messageApi.getAll(),
        messageApi.getUnreadCount(),
      ])
      setMessages(data)
      setUnreadCount(unread.count)
    } catch {
      setError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg)
    setIsDetailOpen(true)
    if (!msg.is_read) {
      try {
        await messageApi.markRead(msg.id)
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // Silently handle
      }
    }
  }

  const openDelete = (msg: ContactMessage) => {
    setDeletingMessage(msg)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingMessage) return
    setIsSubmitting(true)
    try {
      await messageApi.delete(deletingMessage.id)
      setIsDeleteOpen(false)
      setDeletingMessage(null)
      setIsDetailOpen(false)
      setSelectedMessage(null)
      await fetchData()
    } catch {
      setError('Failed to delete message')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMessages = filter === 'unread'
    ? messages.filter((m) => !m.is_read)
    : messages

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Manage contact form submissions"
        action={
          unreadCount > 0 ? (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          ) : undefined
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No messages yet"
          description="Contact form messages will appear here."
        />
      ) : (
        <>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({messages.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
          </div>

          <div className="space-y-2">
            {filteredMessages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' ? 'No unread messages' : 'No messages'}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 rounded-lg border border-border p-3 sm:p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !msg.is_read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="shrink-0 mt-0.5">
                    {msg.is_read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${!msg.is_read ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
                        {msg.name}
                      </h3>
                      {!msg.is_read && (
                        <Badge variant="destructive" className="shrink-0 text-[10px]">New</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                    {msg.subject && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">Re: {msg.subject}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{msg.message}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDate(msg.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openDelete(msg)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.name}</DialogTitle>
            <DialogDescription>{selectedMessage?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedMessage?.subject && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Subject</p>
                <p className="text-sm text-foreground">{selectedMessage.subject}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground">Message</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Received</p>
              <p className="text-sm text-foreground">{selectedMessage?.created_at ? new Date(selectedMessage.created_at).toLocaleString() : ''}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            <Button variant="destructive" onClick={() => { setIsDetailOpen(false); openDelete(selectedMessage!) }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Message"
        description={`Are you sure you want to delete the message from "${deletingMessage?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  )
}
