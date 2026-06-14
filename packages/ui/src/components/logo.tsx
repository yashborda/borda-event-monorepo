import { cn } from '../lib/utils'

type ILogoProps = {
  className?: string
  /** When true, renders the square monogram icon instead of the wordmark. */
  iconOnly?: boolean
  /** 'dark' wordmark for light backgrounds (default); 'light' for dark backgrounds. */
  variant?: 'dark' | 'light'
}

/**
 * Borda Event logo. Renders the brand wordmark (or monogram) from the public
 * assets `/borda-logo.png`, `/borda-logo-light.png`, `/borda-icon.png` —
 * each consuming app ships these in its `public/` directory.
 */
export const Logo = ({
  className,
  iconOnly = false,
  variant = 'dark',
}: ILogoProps) => {
  const src = iconOnly
    ? '/borda-icon.png'
    : variant === 'light'
      ? '/borda-logo-light.png'
      : '/borda-logo.png'

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Borda Event"
      className={cn('object-contain', className)}
    />
  )
}
