import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../stores/auth'
import { ERROR_MESSAGES } from '../constants/messages'

export function useDataFetch<T>(
  fetchFn: (params: { token: string; search?: string; [key: string]: any }) => Promise<T>,
  search: string = '',
  deps: any[] = [],
  options?: { autoFetch?: boolean; extraParams?: Record<string, any> }
) {
  const token = useAuthStore(s => s.token)!
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options?.autoFetch !== false)
  const [error, setError] = useState('')

  const fetch = useCallback(async (override?: { search?: string; extraParams?: Record<string, any> }) => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchFn({
        token,
        search: (override?.search ?? search) || undefined,
        ...(override?.extraParams ?? options?.extraParams ?? {}),
      })
      setData(result)
    } catch (err: any) {
      setError(err?.message || ERROR_MESSAGES.FETCH_FAILED)
    } finally {
      setLoading(false)
    }
  }, [token, search, ...(options?.extraParams ? [JSON.stringify(options.extraParams)] : []), ...deps])

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetch()
    }
  }, [fetch, options?.autoFetch])

  return { data, loading, error, refetch: (override?: { search?: string; extraParams?: Record<string, any> }) => fetch(override) }
}
