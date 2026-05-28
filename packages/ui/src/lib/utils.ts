import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-body-xl',
        'text-body-lg',
        'text-body-md',
        'text-body-sm',
        'text-body-xs',
        'text-label-lg',
        'text-label-md',
        'text-label-sm',
        'text-heading-2xl',
        'text-heading-xl',
        'text-heading-lg',
        'text-heading-md',
        'text-heading-sm',
        'text-heading-xs',
        'text-display-2xl',
        'text-display-xl',
        'text-display-lg',
      ],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
