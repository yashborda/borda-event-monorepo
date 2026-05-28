import { cn } from '../../lib/utils'

type HeadingSize = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
type HeadingAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const sizeClasses: Record<HeadingSize, string> = {
  '2xl': 'text-heading-xl md:text-heading-2xl font-bold',
  xl: 'text-heading-lg md:text-heading-xl font-bold',
  lg: 'text-heading-md md:text-heading-lg font-bold',
  md: 'text-heading-sm md:text-heading-md font-semibold',
  sm: 'text-heading-sm font-semibold',
  xs: 'text-heading-xs font-semibold',
}

type IHeadingProps = {
  as?: HeadingAs
  size?: HeadingSize
  className?: string
  children: React.ReactNode
}

const Heading = ({
  as: Tag = 'h2',
  size = 'xl',
  className,
  children,
}: IHeadingProps) => (
  <Tag className={cn('text-foreground', sizeClasses[size], className)}>
    {children}
  </Tag>
)

export { Heading }
export type { IHeadingProps, HeadingSize, HeadingAs }
