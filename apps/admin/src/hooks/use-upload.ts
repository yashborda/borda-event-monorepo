'use client'

import type { IApiError, IMediaFile } from '@pkg/types'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

export function useUpload() {
  const [uploading, setUploading] = useState(false)

  const upload = async (
    file: File,
    folder = 'general'
  ): Promise<IMediaFile | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      return await apiFetch<IMediaFile>(
        `/api/admin/upload/image?folder=${encodeURIComponent(folder)}`,
        { method: 'POST', body: formData }
      )
    } catch (err) {
      handleException(err as IApiError)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
