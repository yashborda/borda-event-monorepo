import { Heading } from '@pkg/ui'

type Props = {
  title: string
  description?: string
  children?: React.ReactNode
}

export const BlogPageHero = ({ title, description, children }: Props) => (
  <section className="from-primary to-primary/60 bg-linear-to-br py-14 sm:py-20">
    <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center sm:px-6">
      <Heading as="h1" size="2xl" className="text-primary-foreground">
        {title}
      </Heading>
      {description && (
        <p className="text-body-md text-primary-foreground max-w-xl">
          {description}
        </p>
      )}
      {children}
    </div>
  </section>
)
