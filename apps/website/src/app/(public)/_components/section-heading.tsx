import { cn } from '@pkg/ui'

type SectionHeadingProps = {
  /** Small-caps copper eyebrow label. */
  label?: string
  title: string
  description?: string
  /** 'responsive' = centred on mobile, left on desktop. 'center' = always centred. */
  align?: 'responsive' | 'center'
  className?: string
}

export const SectionHeading = ({
  label,
  title,
  description,
  align = 'responsive',
  className,
}: SectionHeadingProps) => (
  <div
    className={cn(
      'flex flex-col gap-3',
      align === 'center'
        ? 'items-center text-center'
        : 'items-center text-center md:items-start md:text-left',
      className
    )}
  >
    {label && (
      <span className="text-label-md text-brand-copper font-semibold">
        {label}
      </span>
    )}
    <h2 className="text-brand-ink font-display text-3xl font-bold md:text-4xl">
      {title}
    </h2>
    {description && (
      <p className="text-muted-foreground text-body-lg max-w-2xl">
        {description}
      </p>
    )}
  </div>
)
