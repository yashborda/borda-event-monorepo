import type { IApiError } from '@pkg/types'
import { toast } from '@pkg/ui'

export const handleException = (
  error: IApiError,
  { showToast = true } = {}
): string => {
  let message: string

  if (error.statusCode === 500) {
    message = 'A server error occurred. Please try again later.'
  } else if (error.statusCode === 403) {
    message =
      error.message || 'You do not have permission to perform this action.'
  } else {
    message = error.message || 'An unexpected error occurred. Please try again.'
  }

  if (showToast) toast.error(message)
  return message
}
