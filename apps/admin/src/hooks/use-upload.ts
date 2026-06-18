'use client'

import type { IApiError, IMediaFile } from '@pkg/types'

import { useState } from 'react'

import { directBackendUrl, getAccessToken } from '@/lib/api-client'
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
      // Post directly to the backend (when configured) to bypass the Next.js
      // rewrite proxy, which buffers and aborts large multipart bodies — images
      // can now be up to 150 MB. Falls back to the proxy when unset.
      const url = directBackendUrl(
        `/api/admin/upload/drive-image?folder=${encodeURIComponent(folder)}`
      )
      const token = getAccessToken()
      const headers: HeadersInit = token
        ? { authorization: `Bearer ${token}` }
        : {}
      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ message: res.statusText, statusCode: res.status }))
        throw Object.assign(new Error(body.message ?? 'Upload failed'), {
          data: body,
          statusCode: res.status,
        })
      }
      return (await res.json()) as IMediaFile
    } catch (err) {
      handleException(err as IApiError)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
