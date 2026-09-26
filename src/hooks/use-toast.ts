import { useCallback } from 'react'
import { toast } from '@/components/ui/toast'

export function useToast() {
  const show = useCallback(
    (message: string, options?: { type?: 'success' | 'error' | 'info' | 'warning'; title?: string }) => {
      toast.add({
        title: message,
        type: options?.type || 'info',
      })
    },
    []
  )

  const success = useCallback((message: string) => {
    toast.add({ title: message, type: 'success' })
  }, [])

  const error = useCallback((message: string) => {
    toast.add({ title: message, type: 'error' })
  }, [])

  const info = useCallback((message: string) => {
    toast.add({ title: message, type: 'info' })
  }, [])

  const warning = useCallback((message: string) => {
    toast.add({ title: message, type: 'warning' })
  }, [])

  return { show, success, error, info, warning }
}
