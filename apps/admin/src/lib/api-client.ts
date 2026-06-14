'use client'

import type { IApiErrorData } from '@pkg/types'

let _accessToken: string | null = null
let _refreshPromise: Promise<string | null> | null = null

export const setAccessToken = (token: string | null) => {
  _accessToken = token
}

export const getAccessToken = (): string | null => {
  return _accessToken
}

type IFetchOptions = RequestInit & { skipRetry?: boolean }

export class ApiError extends Error {
  readonly data: IApiErrorData
  readonly [key: string]: unknown

  constructor(body: IApiErrorData) {
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : (body.message ?? 'Unknown error')
    super(msg)
    this.name = 'ApiError'
    Object.assign(this, body)
    this.data = body
  }
}

const throwApiError = async (res: Response): Promise<never> => {
  const body = await res.json().catch(() => ({
    message: res.statusText,
    statusCode: res.status,
  }))
  throw new ApiError(body as IApiErrorData)
}

const refreshAccessToken = (): Promise<string | null> => {
  if (!_refreshPromise) {
    _refreshPromise = fetch('/api/admin/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { accessToken: string }
          setAccessToken(data.accessToken)
          return data.accessToken
        }
        setAccessToken(null)
        return null
      })
      .catch(() => {
        setAccessToken(null)
        return null
      })
      .finally(() => {
        _refreshPromise = null
      })
  }
  return _refreshPromise
}

/**
 * Build an absolute URL for endpoints that should bypass the Next.js dev
 * rewrite proxy — primarily large-file uploads (videos). The proxy buffers
 * multipart bodies and aborts mid-stream above a certain size, surfacing as
 * Multer "Request aborted" 500s. When NEXT_PUBLIC_BACKEND_DIRECT_URL is set,
 * callers POST straight to the backend (CORS already permits the admin origin).
 * When unset, falls back to the relative path (proxy).
 */
export const directBackendUrl = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_BACKEND_DIRECT_URL
  if (!base) return path
  // Strip trailing slash on base, leading slash on path so we don't double up.
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export const apiFetch = async <T>(
  path: string,
  options: IFetchOptions = {}
): Promise<T> => {
  const { skipRetry, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)
  if (_accessToken) {
    headers.set('Authorization', `Bearer ${_accessToken}`)
  }
  if (
    !headers.has('Content-Type') &&
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...fetchOptions, headers })

  if (res.status === 401 && !skipRetry) {
    const originalData = await res
      .json()
      .catch(() => ({ message: res.statusText }))

    const newToken = await refreshAccessToken()

    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      const retryRes = await fetch(path, { ...fetchOptions, headers })
      if (!retryRes.ok) await throwApiError(retryRes)
      if (retryRes.status === 204) return undefined as T
      return retryRes.json() as Promise<T>
    }

    throw new ApiError(originalData as IApiErrorData)
  }

  if (!res.ok) await throwApiError(res)

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
