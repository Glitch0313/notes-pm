'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  fetchUrl: (page: number) => string
  pageSize?: number
}

export function useInfiniteScroll<T>({ fetchUrl, pageSize = 12 }: UseInfiniteScrollOptions) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isFirstLoad = useRef(true)

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(fetchUrl(pageNum))
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'خطأ في التحميل')

      const newItems: T[] = data.data?.notes ?? data.data ?? []
      const total: number = data.data?.total ?? newItems.length

      setItems((prev) => (reset ? newItems : [...prev, ...newItems]))
      setHasMore((pageNum - 1) * pageSize + newItems.length < total)
    } catch (err: any) {
      setError(err.message || 'خطأ في التحميل')
    } finally {
      setLoading(false)
    }
  }, [fetchUrl, pageSize, loading])

  // Initial load
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      fetchPage(1, true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection observer for sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const next = prev + 1
            fetchPage(next)
            return next
          })
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchPage])

  function reset(newFetchFn?: () => string) {
    setItems([])
    setPage(1)
    setHasMore(true)
    isFirstLoad.current = false
    fetchPage(1, true)
  }

  return { items, loading, hasMore, error, sentinelRef, reset }
}
