import { useEffect, useState } from 'react'

const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

type IUseSearchReturn = {
  search: string
  setSearch: (value: string) => void
  debouncedSearch: string
}

export const useSearch = (delay = 600): IUseSearchReturn => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, delay)
  return { search, setSearch, debouncedSearch }
}
