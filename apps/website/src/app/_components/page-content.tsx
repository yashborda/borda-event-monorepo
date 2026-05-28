type Props = {
  children: React.ReactNode
  className?: string
}

export const PageContent = ({ children, className }: Props) => (
  <section
    className={`container mx-auto px-4 py-12 sm:px-6 sm:py-16 ${className ?? ''}`}
  >
    {children}
  </section>
)
