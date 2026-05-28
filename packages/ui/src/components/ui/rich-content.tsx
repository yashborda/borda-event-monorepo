import { cn } from '../../lib/utils'

const richContentClasses = [
  // Base colour
  'text-foreground',
  // Vertical rhythm — paragraphs, lists, blockquotes, pre, hr, img, table
  '[&_p+p]:mt-4',
  '[&_p+ul]:mt-3 [&_p+ol]:mt-3',
  '[&_ul+p]:mt-4 [&_ol+p]:mt-4',
  '[&_ul+ul]:mt-3 [&_ol+ol]:mt-3',
  '[&_blockquote+*]:mt-6 [&_*+blockquote]:mt-6',
  '[&_pre+*]:mt-6 [&_*+pre]:mt-6',
  '[&_hr+*]:mt-8 [&_*+hr]:mt-8',
  '[&_img+*]:mt-6 [&_*+img]:mt-6',
  '[&_table+*]:mt-6 [&_*+table]:mt-6',
  // Extra space before headings, tight space after them
  '[&_*+h1]:mt-8 [&_*+h2]:mt-8 [&_*+h3]:mt-7 [&_*+h4]:mt-6 [&_*+h5]:mt-6 [&_*+h6]:mt-5',
  '[&_h1]:mb-4 [&_h2]:mb-4 [&_h3]:mb-3 [&_h4]:mb-3 [&_h5]:mb-2 [&_h6]:mb-2',
  // Headings — mobile-first responsive scale
  '[&_h1]:text-heading-lg md:[&_h1]:text-heading-xl [&_h1]:font-bold',
  '[&_h2]:text-heading-md md:[&_h2]:text-heading-lg [&_h2]:font-bold',
  '[&_h3]:text-heading-sm md:[&_h3]:text-heading-md [&_h3]:font-semibold',
  '[&_h4]:text-heading-sm [&_h4]:font-semibold',
  '[&_h5]:text-heading-xs [&_h5]:font-semibold',
  '[&_h6]:text-body-xl [&_h6]:font-medium [&_h6]:text-muted-foreground',
  // Links
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/50 hover:[&_a]:decoration-primary',
  // Inline formatting
  '[&_strong]:font-semibold',
  '[&_em]:italic',
  '[&_u]:underline [&_u]:underline-offset-2',
  '[&_s]:line-through',
  // Inline code (reset inside pre)
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  // Blockquote
  '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
  // Lists
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mt-2',
  '[&_li+li]:mt-2',
  '[&_li>p]:m-0',
  // HR
  '[&_hr]:border-0 [&_hr]:border-t [&_hr]:border-border',
  // Images
  '[&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md',
  // Tables — block + overflow-x-auto makes the table scroll horizontally on small screens
  '[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse',
  '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:align-top',
  '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
  // Mark / highlight (colour is inline style from the editor)
  '[&_mark]:rounded-[0.15em] [&_mark]:px-[0.1em] [&_mark]:py-[0.05em]',
  // Task list — attribute selectors handled in globals.css under .rich-content
  'rich-content',
].join(' ')

type IRichContentProps = {
  html?: string
  children?: React.ReactNode
  className?: string
  'data-slot'?: string
}

const RichContent = ({
  html,
  children,
  className,
  'data-slot': dataSlot = 'rich-content',
}: IRichContentProps) => {
  if (children !== undefined) {
    return (
      <div data-slot={dataSlot} className={cn(richContentClasses, className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      data-slot={dataSlot}
      className={cn(richContentClasses, className)}
      dangerouslySetInnerHTML={{ __html: html ?? '' }}
    />
  )
}

export { RichContent }
export type { IRichContentProps }
