import { useState, useMemo, useEffect } from 'react'

export function useLoadMore<T>(items: T[], pageSize = 10) {
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [items, pageSize])

  const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])
  const canLoadMore = visibleCount < items.length
  const loadMore = () => setVisibleCount((prev) => Math.min(prev + pageSize, items.length))

  return { visible, canLoadMore, loadMore, visibleCount }
}
