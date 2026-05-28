'use client'

import { Input } from '@pkg/ui'
import { IconSearch } from '@tabler/icons-react'
import { useQueryStates } from 'nuqs'

import { useEffect, useRef, useState } from 'react'

import { blogSearchParsers } from '@/lib/blog-search-params'

export const BlogSearchInput = () => {
  const [params, setParams] = useQueryStates(blogSearchParsers, {
    shallow: false,
    history: 'push',
    clearOnDefault: true,
  })

  const [inputValue, setInputValue] = useState(params.search)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!next) {
      timerRef.current = null
      setParams({ search: '', page: 1 })
      return
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setParams({ search: next, page: 1 })
    }, 600)
  }

  return (
    <Input
      type="search"
      size="default"
      placeholder="IconSearch articles…"
      value={inputValue}
      onChange={handleChange}
      icon={<IconSearch />}
      iconPosition="left"
      className="w-full max-w-md"
    />
  )
}
