import { useCallback, useRef, useState } from 'react'

import { generateSlug } from '@/utils/slug.helper'

interface UseSlugOptions {
  initialSlug?: string
}

export function useSlug({ initialSlug = '' }: UseSlugOptions = {}) {
  const [slug, setSlugState] = useState(initialSlug)
  const isManuallyEdited = useRef(false)

  const onSourceChange = useCallback((sourceValue: string) => {
    if (!isManuallyEdited.current) {
      setSlugState(generateSlug(sourceValue))
    }
  }, [])

  const setSlug = useCallback((value: string) => {
    isManuallyEdited.current = true
    setSlugState(value)
  }, [])

  const resetManualEdit = useCallback(() => {
    isManuallyEdited.current = false
  }, [])

  return { slug, setSlug, onSourceChange, resetManualEdit }
}
