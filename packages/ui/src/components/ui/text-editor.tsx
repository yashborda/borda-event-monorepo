'use client'

import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconBraces,
  IconChevronDown,
  IconClipboardCopy,
  IconCode,
  IconColumns3,
  IconDots,
  IconFile,
  IconFileCode,
  IconGripVertical,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconHighlight,
  IconItalic,
  IconLayoutRows,
  IconLetterT,
  IconLink,
  IconLinkOff,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMinus,
  IconPhoto,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconTable,
  IconTableMinus,
  IconTrash,
  IconUnderline,
} from '@tabler/icons-react'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import UnderlineExtension from '@tiptap/extension-underline'
import { NodeSelection } from '@tiptap/pm/state'
import {
  type Editor,
  EditorContent,
  Extension,
  useEditor,
  useEditorState,
} from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion'
import { type VariantProps, cva } from 'class-variance-authority'
import { createPortal } from 'react-dom'
import TurndownService from 'turndown'

import * as React from 'react'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { cn } from '@/lib/utils'

import { Dialog } from './dialog'
import { Input } from './input'
import { Label } from './label'

// ─── Variants ────────────────────────────────────────────────────────────────

const textEditorVariants = cva(
  'border-border bg-background text-foreground flex w-full min-w-0 flex-col rounded-md border has-[.ProseMirror:focus]:border-ring has-[.ProseMirror:focus]:ring-ring/50 has-[.ProseMirror:focus]:ring-[3px]',
  {
    variants: {
      size: {
        sm: 'text-body-sm',
        default: 'text-body-md',
        lg: 'text-body-lg',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

const toolbarButtonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      size: {
        sm: 'size-6',
        default: 'size-7',
        lg: 'size-8',
      },
      active: {
        true: 'bg-primary/10 text-primary',
        false: 'text-muted-foreground hover:bg-muted hover:text-foreground',
      },
    },
    defaultVariants: { size: 'default', active: false },
  }
)

// ─── Types ────────────────────────────────────────────────────────────────────

type ITextEditorClassNames = {
  root?: string
  label?: string
  toolbar?: string
  editor?: string
  footer?: string
  error?: string
}

type ITextEditorProps = Omit<VariantProps<typeof textEditorVariants>, never> & {
  size?: 'sm' | 'default' | 'lg'
  label?: string
  hint?: string
  hintIcon?: React.ReactNode
  placeholder?: string
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  id?: string
  className?: string
  classNames?: ITextEditorClassNames
  maxLength?: number
  showWordCount?: boolean
  height?: number | string
  /** Controlled HTML content */
  value?: string
  /** Uncontrolled initial HTML content */
  defaultValue?: string
  onChange?: (html: string) => void
  /** Which toolbar feature groups to show */
  toolbar?: {
    history?: boolean
    formatting?: boolean
    headings?: boolean
    lists?: boolean
    alignment?: boolean
    link?: boolean
    extras?: boolean
    highlight?: boolean
    image?: boolean
    table?: boolean
    export?: boolean
  }
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

type IToolbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  size?: 'sm' | 'default' | 'lg'
  tooltip?: string
}

const ToolbarButton = ({
  active = false,
  size = 'default',
  className,
  tooltip,
  children,
  ...props
}: IToolbarButtonProps) => (
  <button
    type="button"
    title={tooltip}
    className={cn(toolbarButtonVariants({ size, active }), className)}
    {...props}
  >
    {children}
  </button>
)

// ─── Toolbar Separator ────────────────────────────────────────────────────────

const ToolbarSeparator = () => (
  <span className="bg-border mx-0.5 inline-block h-5 w-px shrink-0" />
)

// ─── Dropdown Item ────────────────────────────────────────────────────────────

type IDropdownItemProps = {
  active?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const DropdownItem = ({ active, onClick, icon, label }: IDropdownItemProps) => (
  <DropdownMenu.Item
    onSelect={onClick}
    className={cn(
      'text-body-md flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none select-none',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-foreground hover:bg-muted focus:bg-muted'
    )}
  >
    <span className="[&_svg]:size-4 [&_svg]:shrink-0">{icon}</span>
    {label}
  </DropdownMenu.Item>
)

// ─── Toolbar Dropdown ─────────────────────────────────────────────────────────

type IToolbarDropdownProps = {
  trigger: React.ReactNode
  active?: boolean
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  tooltip?: string
  /** Set false to render content inline (no portal) — required inside BubbleMenu */
  portal?: boolean
  children: React.ReactNode
}

const ToolbarDropdown = ({
  trigger,
  active = false,
  disabled = false,
  size = 'default',
  tooltip,
  portal = true,
  children,
}: IToolbarDropdownProps) => {
  const content = (
    <DropdownMenu.Content
      sideOffset={4}
      className="bg-popover border-border text-popover-foreground shadow-shadow z-50 min-w-[10rem] rounded-md border p-1 shadow-md"
    >
      {children}
    </DropdownMenu.Content>
  )

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          title={tooltip}
          className={cn(
            'inline-flex cursor-pointer items-center gap-0.5 rounded px-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
            size === 'sm'
              ? 'text-body-sm h-6'
              : size === 'lg'
                ? 'text-body-md h-8'
                : 'text-body-md h-7',
            active
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {trigger}
          <IconChevronDown className="!size-3 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      {portal ? <DropdownMenu.Portal>{content}</DropdownMenu.Portal> : content}
    </DropdownMenu.Root>
  )
}

// ─── Highlight colours ────────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
  { color: '#fef08a', label: 'Yellow' },
  { color: '#bbf7d0', label: 'Green' },
  { color: '#bfdbfe', label: 'Blue' },
  { color: '#fecaca', label: 'Red' },
  { color: '#e9d5ff', label: 'Purple' },
]

const BUBBLE_HIGHLIGHT_COLORS = HIGHLIGHT_COLORS.map((c) => c.color)

// ─── URL validation ───────────────────────────────────────────────────────────

const isValidUrl = (value: string) => {
  try {
    const u = new URL(value)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

// ─── Link Modal ───────────────────────────────────────────────────────────────

type ILinkModalProps = {
  open: boolean
  initialUrl: string
  onApply: (url: string) => void
  onClose: () => void
}

const LinkModal = ({ open, initialUrl, onApply, onClose }: ILinkModalProps) => {
  const [url, setUrl] = React.useState(initialUrl)
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setUrl(initialUrl)
      setTouched(false)
    }
  }, [open, initialUrl])

  const error =
    touched && url && !isValidUrl(url)
      ? 'Enter a valid http/https URL'
      : undefined
  const canApply = url === '' || isValidUrl(url)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
      title="Insert Link"
      actions={[
        {
          label: 'Cancel',
          variant: 'ghost',
          onClick: onClose,
          className: 'ml-auto',
        },
        { label: 'Apply', onClick: () => onApply(url), disabled: !canApply },
      ]}
    >
      <Input
        placeholder="https://example.com"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value)
          setTouched(true)
        }}
        errorMessage={error}
        autoFocus
      />
    </Dialog>
  )
}

// ─── Image Modal ──────────────────────────────────────────────────────────────

type IImageModalProps = {
  open: boolean
  onInsert: (url: string) => void
  onClose: () => void
}

const ImageModal = ({ open, onInsert, onClose }: IImageModalProps) => {
  const [url, setUrl] = React.useState('')

  React.useEffect(() => {
    if (open) setUrl('')
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
      title="Insert Image"
      actions={[
        {
          label: 'Cancel',
          variant: 'ghost',
          onClick: onClose,
          className: 'ml-auto',
        },
        {
          label: 'Insert',
          onClick: () => onInsert(url),
          disabled: !url,
        },
      ]}
    >
      <Input
        placeholder="https://example.com/image.png"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        autoFocus
      />
    </Dialog>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Align left', icon: <IconAlignLeft /> },
  { value: 'center', label: 'Align center', icon: <IconAlignCenter /> },
  { value: 'right', label: 'Align right', icon: <IconAlignRight /> },
  { value: 'justify', label: 'Justify', icon: <IconAlignJustified /> },
] as const

type IEditorCallbacks = {
  openLinkModal: () => void
  openImageModal: (range?: { from: number; to: number }) => void
}

type IToolbarProps = {
  editor: Editor
  size: 'sm' | 'default' | 'lg'
  disabled: boolean
  className?: string
  toolbar: Required<NonNullable<ITextEditorProps['toolbar']>>
  onLinkClick: () => void
  onImageClick: () => void
}

const Toolbar = ({
  editor,
  size,
  disabled,
  className,
  toolbar,
  onLinkClick,
  onImageClick,
}: IToolbarProps) => {
  // Subscribe to editor state so toolbar re-renders on every cursor/selection change
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor.isActive('bold'),
      italic: ctx.editor.isActive('italic'),
      underline: ctx.editor.isActive('underline'),
      strike: ctx.editor.isActive('strike'),
      code: ctx.editor.isActive('code'),
      highlight: ctx.editor.isActive('highlight'),
      link: ctx.editor.isActive('link'),
      bulletList: ctx.editor.isActive('bulletList'),
      orderedList: ctx.editor.isActive('orderedList'),
      taskList: ctx.editor.isActive('taskList'),
      blockquote: ctx.editor.isActive('blockquote'),
      table: ctx.editor.isActive('table'),
      h1: ctx.editor.isActive('heading', { level: 1 }),
      h2: ctx.editor.isActive('heading', { level: 2 }),
      h3: ctx.editor.isActive('heading', { level: 3 }),
      h4: ctx.editor.isActive('heading', { level: 4 }),
      h5: ctx.editor.isActive('heading', { level: 5 }),
      h6: ctx.editor.isActive('heading', { level: 6 }),
      alignLeft: ctx.editor.isActive({ textAlign: 'left' }),
      alignCenter: ctx.editor.isActive({ textAlign: 'center' }),
      alignRight: ctx.editor.isActive({ textAlign: 'right' }),
      alignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
      canUndo: ctx.editor.can().undo(),
      canRedo: ctx.editor.can().redo(),
    }),
  })

  const activeHeadingLevel = ([1, 2, 3, 4, 5, 6] as const).find(
    (l) => state[`h${l}` as keyof typeof state]
  )
  const headingLabel = activeHeadingLevel ? `H${activeHeadingLevel}` : 'Normal'

  const activeAlign = ALIGN_OPTIONS.find(
    (o) =>
      state[
        `align${o.value.charAt(0).toUpperCase() + o.value.slice(1)}` as keyof typeof state
      ]
  )
  const alignIcon = activeAlign?.icon ?? <IconAlignLeft />

  const activeList = state.taskList
    ? 'Tasks'
    : state.bulletList
      ? 'Bullet'
      : state.orderedList
        ? 'Numbered'
        : 'List'

  const groups: React.ReactNode[] = []

  if (toolbar.history) {
    groups.push(
      <div key="history" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Undo"
          disabled={disabled || !state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <IconArrowBackUp />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Redo"
          disabled={disabled || !state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <IconArrowForwardUp />
        </ToolbarButton>
      </div>
    )
  }

  if (toolbar.headings) {
    groups.push(
      <ToolbarDropdown
        key="headings"
        trigger={
          <span className="min-w-[3.5rem] text-left font-medium">
            {headingLabel}
          </span>
        }
        active={!!activeHeadingLevel}
        disabled={disabled}
        size={size}
        tooltip="Text style"
      >
        <DropdownItem
          active={!activeHeadingLevel}
          onClick={() => editor.chain().focus().setParagraph().run()}
          icon={<span className="text-body-md">¶</span>}
          label="Normal"
        />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <DropdownItem
            key={level}
            active={state[`h${level}` as keyof typeof state] as boolean}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
            icon={
              <span
                className={cn(
                  'text-body-md',
                  level <= 3
                    ? 'font-bold'
                    : level === 4
                      ? 'font-semibold'
                      : 'font-medium'
                )}
              >
                H{level}
              </span>
            }
            label={`Heading ${level}`}
          />
        ))}
      </ToolbarDropdown>
    )
  }

  if (toolbar.formatting) {
    groups.push(
      <div key="formatting" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Bold"
          active={state.bold}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Italic"
          active={state.italic}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Underline"
          active={state.underline}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Strikethrough"
          active={state.strike}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrikethrough />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Code"
          active={state.code}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <IconCode />
        </ToolbarButton>
      </div>
    )
  }

  if (toolbar.highlight) {
    groups.push(
      <ToolbarDropdown
        key="highlight"
        trigger={<IconHighlight />}
        active={state.highlight}
        disabled={disabled}
        size={size}
        tooltip="Highlight"
      >
        {HIGHLIGHT_COLORS.map(({ color, label }) => (
          <DropdownMenu.Item
            key={color}
            onSelect={() =>
              editor.chain().focus().setHighlight({ color }).run()
            }
            className="hover:bg-muted focus:bg-muted text-body-md flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none select-none"
          >
            <span
              className="border-border size-4 shrink-0 rounded-sm border"
              style={{ backgroundColor: color }}
            />
            {label}
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Separator className="border-border my-1 border-t" />
        <DropdownMenu.Item
          onSelect={() => editor.chain().focus().unsetHighlight().run()}
          className="text-muted-foreground hover:bg-muted focus:bg-muted text-body-md flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none select-none"
        >
          Remove highlight
        </DropdownMenu.Item>
      </ToolbarDropdown>
    )
  }

  if (toolbar.lists) {
    groups.push(
      <ToolbarDropdown
        key="lists"
        trigger={
          <>
            {state.orderedList ? (
              <IconListNumbers />
            ) : state.taskList ? (
              <IconListCheck />
            ) : (
              <IconList />
            )}
            <span className="min-w-[3.5rem] text-left">{activeList}</span>
          </>
        }
        active={state.bulletList || state.orderedList || state.taskList}
        disabled={disabled}
        size={size}
        tooltip="List style"
      >
        <DropdownItem
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<IconList />}
          label="Bullet list"
        />
        <DropdownItem
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<IconListNumbers />}
          label="Numbered list"
        />
        <DropdownItem
          active={state.taskList}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          icon={<IconListCheck />}
          label="Task list"
        />
      </ToolbarDropdown>
    )
  }

  if (toolbar.alignment) {
    groups.push(
      <ToolbarDropdown
        key="alignment"
        trigger={alignIcon}
        active={!!activeAlign && activeAlign.value !== 'left'}
        disabled={disabled}
        size={size}
        tooltip="Text alignment"
      >
        {ALIGN_OPTIONS.map((opt) => (
          <DropdownItem
            key={opt.value}
            active={
              state[
                `align${opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}` as keyof typeof state
              ] as boolean
            }
            onClick={() => editor.chain().focus().setTextAlign(opt.value).run()}
            icon={opt.icon}
            label={opt.label}
          />
        ))}
      </ToolbarDropdown>
    )
  }

  if (toolbar.link) {
    groups.push(
      <div key="link" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Insert / edit link"
          active={state.link}
          disabled={disabled}
          onClick={onLinkClick}
        >
          <IconLink />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Remove link"
          disabled={disabled || !state.link}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <IconLinkOff />
        </ToolbarButton>
      </div>
    )
  }

  if (toolbar.image) {
    groups.push(
      <div key="image" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Insert image"
          disabled={disabled}
          onClick={onImageClick}
        >
          <IconPhoto />
        </ToolbarButton>
      </div>
    )
  }

  if (toolbar.table) {
    groups.push(
      <div key="table" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Insert table"
          active={state.table}
          disabled={disabled}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <IconTable />
        </ToolbarButton>
      </div>
    )
  }

  if (toolbar.extras) {
    groups.push(
      <div key="extras" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Blockquote"
          active={state.blockquote}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconBlockquote />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Horizontal rule"
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <IconMinus />
        </ToolbarButton>
      </div>
    )
  }

  if (toolbar.export) {
    const td = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
    })
    groups.push(
      <div key="export" className="flex items-center gap-0.5">
        <ToolbarButton
          size={size}
          tooltip="Copy as HTML"
          disabled={disabled}
          onClick={() => void navigator.clipboard.writeText(editor.getHTML())}
        >
          <IconFileCode />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Copy as plain text"
          disabled={disabled}
          onClick={() => void navigator.clipboard.writeText(editor.getText())}
        >
          <IconFile />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          tooltip="Copy as Markdown"
          disabled={disabled}
          onClick={() =>
            void navigator.clipboard.writeText(td.turndown(editor.getHTML()))
          }
        >
          <IconClipboardCopy />
        </ToolbarButton>
      </div>
    )
  }

  // Interleave separators between groups
  const withSeparators = groups.flatMap((group, i) =>
    i < groups.length - 1
      ? [group, <ToolbarSeparator key={`sep-${i}`} />]
      : [group]
  )

  return (
    <div
      data-slot="text-editor-toolbar"
      className={cn(
        'border-border flex flex-wrap items-center gap-1 border-b p-1.5',
        className
      )}
    >
      {withSeparators}
    </div>
  )
}

// ─── Slash Command ────────────────────────────────────────────────────────────

type ISlashCommand = {
  group: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  command: (args: {
    editor: Editor
    range: { from: number; to: number }
  }) => void
}

const SLASH_COMMANDS: ISlashCommand[] = [
  // Style
  {
    group: 'Style',
    label: 'Text',
    icon: IconLetterT,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    group: 'Style',
    label: 'Heading 1',
    icon: IconH1,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    group: 'Style',
    label: 'Heading 2',
    icon: IconH2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    group: 'Style',
    label: 'Heading 3',
    icon: IconH3,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    group: 'Style',
    label: 'Heading 4',
    icon: IconH4,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run(),
  },
  {
    group: 'Style',
    label: 'Heading 5',
    icon: IconH5,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 5 }).run(),
  },
  {
    group: 'Style',
    label: 'Heading 6',
    icon: IconH6,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 6 }).run(),
  },
  // IconList
  {
    group: 'List',
    label: 'Bullet List',
    icon: IconList,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    group: 'List',
    label: 'Numbered List',
    icon: IconListNumbers,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    group: 'List',
    label: 'Task List',
    icon: IconListCheck,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  // Insert
  {
    group: 'Insert',
    label: 'Table',
    icon: IconTable,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    group: 'Insert',
    label: 'Image',
    icon: IconPhoto,
    command: ({ editor, range }) => {
      const url = window.prompt('Image URL')
      if (!url) return
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
    },
  },
  {
    group: 'Insert',
    label: 'Blockquote',
    icon: IconBlockquote,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    group: 'Insert',
    label: 'Code Block',
    icon: IconBraces,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    group: 'Insert',
    label: 'Divider',
    icon: IconMinus,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
]

type ISlashMenuState = {
  query: string
  range: { from: number; to: number }
  items: ISlashCommand[]
  clientRect: (() => DOMRect | null) | null
  selectedIndex: number
}

type ISlashCommandMenuProps = {
  state: ISlashMenuState
  onSelect: (item: ISlashCommand) => void
}

const SlashCommandMenu = ({ state, onSelect }: ISlashCommandMenuProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { items, selectedIndex, clientRect } = state

  // Scroll selected item into view
  React.useEffect(() => {
    containerRef.current
      ?.querySelector(`[data-idx="${selectedIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const rect = clientRect?.()
  if (items.length === 0 || !rect) return null

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 6,
    left: rect.left,
    zIndex: 9999,
  }

  // Group items by section
  const groups = items.reduce<Record<string, ISlashCommand[]>>((acc, cmd) => {
    ;(acc[cmd.group] ??= []).push(cmd)
    return acc
  }, {})

  return createPortal(
    <div
      ref={containerRef}
      style={style}
      className="bg-popover border-border text-popover-foreground shadow-shadow flex max-h-72 min-w-[14rem] flex-col overflow-y-auto rounded-md border shadow-lg"
    >
      {Object.entries(groups).map(([group, cmds]) => (
        <div key={group}>
          <p className="text-muted-foreground text-label-md px-3 pt-2 pb-1">
            {group}
          </p>
          {cmds.map((cmd) => {
            const idx = items.indexOf(cmd)
            return (
              <button
                key={cmd.label}
                data-idx={idx}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(cmd)
                }}
                className={cn(
                  'text-body-md flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors',
                  idx === selectedIndex
                    ? 'bg-muted text-foreground'
                    : 'hover:bg-muted/60'
                )}
              >
                <cmd.icon className="text-muted-foreground size-4 shrink-0" />
                {cmd.label}
              </button>
            )
          })}
        </div>
      ))}
    </div>,
    document.body
  )
}

/** Creates the slash-command TipTap extension with stable ref-based callbacks */
const createSlashExtension = (
  callbackRef: React.RefObject<ISlashCallbacks | null>,
  editorCallbacksRef: React.RefObject<IEditorCallbacks | null>
) =>
  Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: '/',
          allowSpaces: false,
          items: ({ query }) =>
            SLASH_COMMANDS.filter(
              (c) =>
                c.label.toLowerCase().startsWith(query.toLowerCase()) ||
                c.group.toLowerCase().startsWith(query.toLowerCase())
            ),
          render: () => ({
            onStart: (props) => callbackRef.current?.onStart(props),
            onUpdate: (props) => callbackRef.current?.onUpdate(props),
            onExit: () => callbackRef.current?.onExit(),
            onKeyDown: ({ event }) =>
              callbackRef.current?.onKeyDown(event) ?? false,
          }),
          command: ({ editor, range, props }) => {
            const cmd = props as ISlashCommand
            if (cmd.label === 'Image') {
              editorCallbacksRef.current?.openImageModal(range)
            } else {
              cmd.command({ editor, range })
            }
          },
        }),
      ]
    },
  })

type ISlashCallbacks = {
  onStart: (props: SuggestionProps<ISlashCommand>) => void
  onUpdate: (props: SuggestionProps<ISlashCommand>) => void
  onExit: () => void
  onKeyDown: (event: KeyboardEvent) => boolean
}

// ─── Drag Handle ──────────────────────────────────────────────────────────────

/** Size of the drag handle in px (matches size-6 = 24px) */
const HANDLE_SIZE = 24

const DragHandle = ({ editor }: { editor: Editor }) => {
  const [handlePos, setHandlePos] = React.useState<{
    top: number
    left: number
  } | null>(null)
  /** ProseMirror position of the start of the hovered top-level block */
  const blockStartRef = React.useRef<number>(-1)
  /**
   * Mirror of handlePos kept in a ref so the document mousemove closure
   * always sees the latest value without needing to re-register the handler.
   */
  const handlePosRef = React.useRef<{ top: number; left: number } | null>(null)

  const setPos = React.useCallback(
    (pos: { top: number; left: number } | null) => {
      handlePosRef.current = pos
      setHandlePos(pos)
    },
    []
  )

  React.useEffect(() => {
    const editorDom = editor.view.dom as HTMLElement

    const onMove = (e: MouseEvent) => {
      const mx = e.clientX
      const my = e.clientY
      const editorRect = editorDom.getBoundingClientRect()

      // Coordinate-based checks — avoids portal DOM-containment gap issues
      const inEditor =
        mx >= editorRect.left &&
        mx <= editorRect.right &&
        my >= editorRect.top &&
        my <= editorRect.bottom

      const hp = handlePosRef.current
      const inHandle =
        hp !== null &&
        mx >= hp.left - 4 &&
        mx <= hp.left + HANDLE_SIZE + 4 &&
        my >= hp.top - 4 &&
        my <= hp.top + HANDLE_SIZE + 4

      if (!inEditor && !inHandle) {
        setPos(null)
        return
      }

      // Mouse is over the handle — keep the current position
      if (!inEditor) return

      // Hide while a floating menu is visible (text selected or inside table)
      const { from, to } = editor.view.state.selection
      if (
        from !== to ||
        editor.isActive('tableCell') ||
        editor.isActive('tableHeader')
      ) {
        setPos(null)
        return
      }

      const resolved = editor.view.posAtCoords({ left: mx, top: my })
      if (!resolved) {
        setPos(null)
        return
      }

      let blockDom = editor.view.domAtPos(resolved.pos).node as HTMLElement
      while (blockDom.parentElement && blockDom.parentElement !== editorDom) {
        blockDom = blockDom.parentElement
      }
      if (!blockDom || blockDom === editorDom) {
        setPos(null)
        return
      }

      try {
        const pmPos = editor.view.posAtDOM(blockDom, 0)
        const $pos = editor.view.state.doc.resolve(pmPos)
        blockStartRef.current = $pos.before($pos.depth)
      } catch {
        setPos(null)
        return
      }

      const nodeRect = blockDom.getBoundingClientRect()
      setPos({
        top: nodeRect.top + nodeRect.height / 2 - HANDLE_SIZE / 2,
        // Flush against the editor left edge — no gap to cross
        left: editorRect.left - HANDLE_SIZE,
      })
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [editor, setPos])

  /**
   * Callback ref — combines handle DOM tracking + native dragstart listener.
   * Using native addEventListener keeps view.dragging mutation outside the
   * React Compiler's immutability check.
   */
  const handleRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return

      el.addEventListener('dragstart', (e) => {
        const view = editor.view
        const pos = blockStartRef.current
        if (pos < 0) {
          e.preventDefault()
          return
        }

        try {
          const selection = NodeSelection.create(view.state.doc, pos)
          view.dispatch(view.state.tr.setSelection(selection))

          const slice = selection.content()
          // Mutating view.dragging is intentional — it signals ProseMirror
          // that this is an in-editor move drag from an external handle.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(view as any).dragging = { slice, move: true }

          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData(
              'text/plain',
              slice.content.textBetween(0, slice.content.size, '\n')
            )
          }
        } catch {
          e.preventDefault()
        }
      })
    },
    [editor]
  )

  if (!handlePos) return null

  return createPortal(
    <div
      ref={handleRef}
      draggable
      style={{
        position: 'fixed',
        top: handlePos.top,
        left: handlePos.left,
        zIndex: 50,
      }}
      className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-6 cursor-grab items-center justify-center rounded transition-colors active:cursor-grabbing"
      title="Drag to reorder"
    >
      <IconGripVertical className="size-4" />
    </div>,
    document.body
  )
}

// ─── Table Toolbar ────────────────────────────────────────────────────────────

type ITableBubbleMenuProps = {
  editor: Editor
  size: 'sm' | 'default' | 'lg'
}

const TableBubbleMenu = ({ editor, size }: ITableBubbleMenuProps) => (
  <BubbleMenu
    editor={editor}
    shouldShow={({ editor: e }) =>
      !e.view.dragging && (e.isActive('tableCell') || e.isActive('tableHeader'))
    }
    options={{ placement: 'bottom-start' }}
    className="bg-popover border-border shadow-shadow z-50 flex items-center gap-0.5 rounded-md border p-1 shadow-md"
  >
    <ToolbarButton
      size={size}
      tooltip="Add row before"
      onClick={() => editor.chain().focus().addRowBefore().run()}
    >
      <IconLayoutRows />
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Add row after"
      onClick={() => editor.chain().focus().addRowAfter().run()}
    >
      <IconLayoutRows />
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Delete row"
      onClick={() => editor.chain().focus().deleteRow().run()}
    >
      <IconTrash />
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton
      size={size}
      tooltip="Add column before"
      onClick={() => editor.chain().focus().addColumnBefore().run()}
    >
      <IconColumns3 />
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Add column after"
      onClick={() => editor.chain().focus().addColumnAfter().run()}
    >
      <IconColumns3 />
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Delete column"
      onClick={() => editor.chain().focus().deleteColumn().run()}
    >
      <IconTrash />
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton
      size={size}
      tooltip="Delete table"
      onClick={() => editor.chain().focus().deleteTable().run()}
    >
      <IconTableMinus />
    </ToolbarButton>
  </BubbleMenu>
)

// ─── Bubble Menu ──────────────────────────────────────────────────────────────

const TEXT_COLORS = [
  { color: 'default', label: 'Default' },
  { color: '#6b7280', label: 'Gray' },
  { color: '#ef4444', label: 'Red' },
  { color: '#f97316', label: 'Orange' },
  { color: '#eab308', label: 'Yellow' },
  { color: '#22c55e', label: 'Green' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
] as const

type IEditorBubbleMenuProps = {
  editor: Editor
  size: 'sm' | 'default' | 'lg'
  onLinkClick: () => void
}

const EditorBubbleMenu = ({
  editor,
  size,
  onLinkClick,
}: IEditorBubbleMenuProps) => {
  const [showMore, setShowMore] = React.useState(false)

  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor.isActive('bold'),
      italic: ctx.editor.isActive('italic'),
      underline: ctx.editor.isActive('underline'),
      strike: ctx.editor.isActive('strike'),
      code: ctx.editor.isActive('code'),
      link: ctx.editor.isActive('link'),
      superscript: ctx.editor.isActive('superscript'),
      subscript: ctx.editor.isActive('subscript'),
      alignLeft: ctx.editor.isActive({ textAlign: 'left' }),
      alignCenter: ctx.editor.isActive({ textAlign: 'center' }),
      alignRight: ctx.editor.isActive({ textAlign: 'right' }),
      alignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
      h1: ctx.editor.isActive('heading', { level: 1 }),
      h2: ctx.editor.isActive('heading', { level: 2 }),
      h3: ctx.editor.isActive('heading', { level: 3 }),
      h4: ctx.editor.isActive('heading', { level: 4 }),
      h5: ctx.editor.isActive('heading', { level: 5 }),
      h6: ctx.editor.isActive('heading', { level: 6 }),
      textColor:
        (ctx.editor.getAttributes('textStyle').color as string) ?? null,
    }),
  })

  const activeHeadingLevel = ([1, 2, 3, 4, 5, 6] as const).find(
    (l) => s[`h${l}` as keyof typeof s]
  )
  const headingLabel = activeHeadingLevel ? `H${activeHeadingLevel}` : 'Text'

  const menuClass =
    'bg-popover border-border z-50 flex flex-col gap-0 rounded-md border shadow-lg shadow-shadow overflow-hidden'
  const rowClass = 'flex items-center gap-0 p-0.5'
  const sepClass = 'bg-border mx-0.5 h-5 w-px shrink-0'

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e, from, to }) =>
        !e.view.dragging &&
        !e.isActive('tableCell') &&
        !e.isActive('tableHeader') &&
        from !== to
      }
      options={{ placement: 'top' }}
      className={menuClass}
    >
      {/* More panel — slides in above the main row */}
      {showMore && (
        <div className={cn(rowClass, 'border-border border-b')}>
          {/* Superscript / Subscript */}
          <ToolbarButton
            size={size}
            active={s.superscript}
            tooltip="Superscript"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <IconSuperscript />
          </ToolbarButton>
          <ToolbarButton
            size={size}
            active={s.subscript}
            tooltip="Subscript"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            <IconSubscript />
          </ToolbarButton>
          <span className={sepClass} />
          {/* Alignment */}
          <ToolbarButton
            size={size}
            active={s.alignLeft}
            tooltip="Align left"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <IconAlignLeft />
          </ToolbarButton>
          <ToolbarButton
            size={size}
            active={s.alignCenter}
            tooltip="Align center"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <IconAlignCenter />
          </ToolbarButton>
          <ToolbarButton
            size={size}
            active={s.alignRight}
            tooltip="Align right"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <IconAlignRight />
          </ToolbarButton>
          <ToolbarButton
            size={size}
            active={s.alignJustify}
            tooltip="Justify"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <IconAlignJustified />
          </ToolbarButton>
          <span className={sepClass} />
          {/* Highlight swatches */}
          {BUBBLE_HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title="Highlight"
              onClick={() =>
                editor.chain().focus().setHighlight({ color }).run()
              }
              className="border-border size-5 shrink-0 cursor-pointer rounded-sm border transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
          <ToolbarButton
            size={size}
            tooltip="Remove highlight"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            <IconHighlight />
          </ToolbarButton>
        </div>
      )}

      {/* Main row */}
      <div className={rowClass}>
        {/* Heading / text style dropdown */}
        <ToolbarDropdown
          trigger={
            <span className="text-body-sm min-w-[3.25rem] text-left font-medium">
              {headingLabel}
            </span>
          }
          active={!!activeHeadingLevel}
          size={size}
          tooltip="Text style"
          portal={false}
        >
          <DropdownItem
            active={!activeHeadingLevel}
            onClick={() => editor.chain().focus().setParagraph().run()}
            icon={<span className="text-body-md">¶</span>}
            label="Normal"
          />
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <DropdownItem
              key={level}
              active={s[`h${level}` as keyof typeof s] as boolean}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level }).run()
              }
              icon={
                <span
                  className={cn(
                    'text-body-md',
                    level <= 3
                      ? 'font-bold'
                      : level === 4
                        ? 'font-semibold'
                        : 'font-medium'
                  )}
                >
                  H{level}
                </span>
              }
              label={`Heading ${level}`}
            />
          ))}
        </ToolbarDropdown>

        <span className={sepClass} />

        {/* Formatting */}
        <ToolbarButton
          size={size}
          active={s.bold}
          tooltip="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          active={s.italic}
          tooltip="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          active={s.underline}
          tooltip="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          active={s.strike}
          tooltip="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrikethrough />
        </ToolbarButton>
        <ToolbarButton
          size={size}
          active={s.code}
          tooltip="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <IconCode />
        </ToolbarButton>

        <span className={sepClass} />

        {/* Link */}
        <ToolbarButton
          size={size}
          active={s.link}
          tooltip="Link"
          onClick={onLinkClick}
        >
          <IconLink />
        </ToolbarButton>

        <span className={sepClass} />

        {/* Text color "A" */}
        <ToolbarDropdown
          trigger={
            <span className="flex flex-col items-center">
              <span className="text-body-sm leading-none font-bold">A</span>
              <span
                className="mt-0.5 h-[3px] w-3.5 rounded-full"
                style={{ backgroundColor: s.textColor ?? 'currentColor' }}
              />
            </span>
          }
          active={!!s.textColor}
          size={size}
          tooltip="Text color"
          portal={false}
        >
          {TEXT_COLORS.map(({ color, label }) => (
            <DropdownMenu.Item
              key={color}
              onSelect={() =>
                color === 'default'
                  ? editor.chain().focus().unsetColor().run()
                  : editor.chain().focus().setColor(color).run()
              }
              className="hover:bg-muted focus:bg-muted text-body-md flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none select-none"
            >
              <span
                className="border-border size-4 shrink-0 rounded-full border"
                style={{
                  backgroundColor: color === 'default' ? 'transparent' : color,
                }}
              />
              {label}
            </DropdownMenu.Item>
          ))}
        </ToolbarDropdown>

        <span className={sepClass} />

        {/* More toggle */}
        <ToolbarButton
          size={size}
          active={showMore}
          tooltip={showMore ? 'Fewer options' : 'More options'}
          onClick={() => setShowMore((v) => !v)}
        >
          <IconDots />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  )
}

// ─── Floating Menu ────────────────────────────────────────────────────────────

type IEditorFloatingMenuProps = {
  editor: Editor
  size: 'sm' | 'default' | 'lg'
  onImageClick: () => void
}

const EditorFloatingMenu = ({
  editor,
  size,
  onImageClick,
}: IEditorFloatingMenuProps) => (
  <FloatingMenu
    editor={editor}
    options={{ placement: 'left' }}
    className="bg-popover border-border shadow-shadow z-50 flex items-center gap-0.5 rounded-md border p-1 shadow-md"
  >
    <ToolbarButton
      size={size}
      tooltip="Heading 1"
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
    >
      <span className="text-body-sm px-0.5 font-bold">H1</span>
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Heading 2"
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    >
      <span className="text-body-sm px-0.5 font-bold">H2</span>
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton
      size={size}
      tooltip="Bullet list"
      onClick={() => editor.chain().focus().toggleBulletList().run()}
    >
      <IconList />
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Task list"
      onClick={() => editor.chain().focus().toggleTaskList().run()}
    >
      <IconListCheck />
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton size={size} tooltip="Insert image" onClick={onImageClick}>
      <IconPhoto />
    </ToolbarButton>
    <ToolbarButton
      size={size}
      tooltip="Insert table"
      onClick={() =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      }
    >
      <IconTable />
    </ToolbarButton>
  </FloatingMenu>
)

// ─── TextEditor ───────────────────────────────────────────────────────────────

const DEFAULT_TOOLBAR: Required<NonNullable<ITextEditorProps['toolbar']>> = {
  history: true,
  formatting: true,
  headings: true,
  lists: true,
  alignment: true,
  link: true,
  extras: true,
  highlight: true,
  image: true,
  table: true,
  export: true,
}

const TextEditor = ({
  size = 'default',
  label,
  hint,
  hintIcon,
  placeholder,
  errorMessage,
  disabled = false,
  required,
  id,
  className,
  classNames,
  maxLength,
  showWordCount = false,
  height = 400,
  value,
  defaultValue,
  onChange,
  toolbar: toolbarConfig,
}: ITextEditorProps) => {
  const toolbar = { ...DEFAULT_TOOLBAR, ...toolbarConfig }

  // ── Modal state ───────────────────────────────────────────────────────────
  const [linkModalOpen, setLinkModalOpen] = React.useState(false)
  const [imageModalOpen, setImageModalOpen] = React.useState(false)
  const imageRangeRef = React.useRef<{ from: number; to: number } | null>(null)

  const editorCallbacksRef = React.useRef<IEditorCallbacks | null>(null)
  editorCallbacksRef.current = {
    openLinkModal: () => setLinkModalOpen(true),
    openImageModal: (range) => {
      imageRangeRef.current = range ?? null
      setImageModalOpen(true)
    },
  }

  const handleLinkApply = (url: string) => {
    setLinkModalOpen(false)
    if (!editor) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: '_blank' })
        .run()
    }
  }

  const handleImageInsert = (url: string) => {
    setImageModalOpen(false)
    if (!editor) return
    const range = imageRangeRef.current
    if (range) {
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      imageRangeRef.current = null
    } else {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  // ── Slash command state ────────────────────────────────────────────────────
  const [slashMenu, setSlashMenu] = React.useState<ISlashMenuState | null>(null)
  const slashCallbacks = React.useRef<ISlashCallbacks | null>(null)

  slashCallbacks.current = {
    onStart: ({ query, range, items, clientRect }) => {
      setSlashMenu({
        query,
        range,
        items,
        clientRect: clientRect ?? null,
        selectedIndex: 0,
      })
    },
    onUpdate: ({ query, range, items, clientRect }) => {
      setSlashMenu((prev) =>
        prev
          ? {
              ...prev,
              query,
              range,
              items,
              clientRect: clientRect ?? null,
              selectedIndex: 0,
            }
          : null
      )
    },
    onExit: () => setSlashMenu(null),
    onKeyDown: (event) => {
      if (!slashMenu) return false
      if (event.key === 'ArrowDown') {
        setSlashMenu((prev) =>
          prev
            ? {
                ...prev,
                selectedIndex: (prev.selectedIndex + 1) % prev.items.length,
              }
            : null
        )
        return true
      }
      if (event.key === 'ArrowUp') {
        setSlashMenu((prev) =>
          prev
            ? {
                ...prev,
                selectedIndex:
                  (prev.selectedIndex - 1 + prev.items.length) %
                  prev.items.length,
              }
            : null
        )
        return true
      }
      if (event.key === 'Enter') {
        const selected = slashMenu.items[slashMenu.selectedIndex]
        if (selected && editor) {
          selected.command({ editor, range: slashMenu.range })
          setSlashMenu(null)
        }
        return true
      }
      if (event.key === 'Escape') {
        setSlashMenu(null)
        return true
      }
      return false
    },
  }

  // Stable extension — uses ref so callbacks never go stale
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const slashExtension = React.useMemo(
    () => createSlashExtension(slashCallbacks, editorCallbacksRef),
    []
  )

  const extensions = [
    StarterKit.configure({ link: false, underline: false }),
    UnderlineExtension,
    Superscript,
    Subscript,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder: placeholder ?? '' }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Image,
    Highlight.configure({ multicolor: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
    ...(maxLength !== undefined
      ? [CharacterCount.configure({ limit: maxLength })]
      : [CharacterCount]),
    slashExtension,
  ]

  const editor = useEditor({
    extensions,
    content: value ?? defaultValue ?? '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate({ editor: e }) {
      onChange?.(e.getHTML())
    },
  })

  // Sync controlled `value`
  const prevValue = React.useRef(value)
  React.useEffect(() => {
    if (!editor || value === undefined) return
    if (value !== prevValue.current && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
    prevValue.current = value
  }, [editor, value])

  // Sync disabled
  React.useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  const charCount = editor?.storage.characterCount?.characters?.() ?? 0
  const wordCount = editor?.storage.characterCount?.words?.() ?? 0
  const isInvalid = !!errorMessage
  const showFooter = maxLength !== undefined || showWordCount

  const editorSizeClasses: Record<'sm' | 'default' | 'lg', string> = {
    sm: 'min-h-[120px] px-3 py-2',
    default: 'min-h-[160px] px-3.5 py-3',
    lg: 'min-h-[200px] px-4 py-3.5',
  }

  const editorEl = (
    <div
      id={id}
      data-slot="text-editor"
      aria-invalid={isInvalid ? 'true' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      className={cn(
        textEditorVariants({ size }),
        isInvalid &&
          'border-destructive ring-destructive/20 dark:ring-destructive/40 has-[.ProseMirror:focus]:border-destructive has-[.ProseMirror:focus]:ring-destructive/20',
        disabled && 'bg-muted cursor-not-allowed opacity-100',
        classNames?.root
      )}
    >
      {editor && (
        <Toolbar
          editor={editor}
          size={size}
          disabled={disabled}
          className={classNames?.toolbar}
          toolbar={toolbar}
          onLinkClick={() => editorCallbacksRef.current?.openLinkModal()}
          onImageClick={() => editorCallbacksRef.current?.openImageModal()}
        />
      )}
      <EditorContent
        editor={editor}
        className={cn(
          height ? 'overflow-y-auto' : 'flex-1',
          editorSizeClasses[size],
          classNames?.editor
        )}
        style={height !== undefined ? { height } : undefined}
      />
      {editor && !disabled && (
        <EditorBubbleMenu
          editor={editor}
          size={size}
          onLinkClick={() => editorCallbacksRef.current?.openLinkModal()}
        />
      )}
      {editor && !disabled && <TableBubbleMenu editor={editor} size={size} />}
      {editor && !disabled && (
        <EditorFloatingMenu
          editor={editor}
          size={size}
          onImageClick={() => editorCallbacksRef.current?.openImageModal()}
        />
      )}
      {editor && !disabled && <DragHandle editor={editor} />}
      <LinkModal
        open={linkModalOpen}
        initialUrl={(editor?.getAttributes('link').href as string) ?? ''}
        onApply={handleLinkApply}
        onClose={() => setLinkModalOpen(false)}
      />
      <ImageModal
        open={imageModalOpen}
        onInsert={handleImageInsert}
        onClose={() => setImageModalOpen(false)}
      />
      {slashMenu && (
        <SlashCommandMenu
          state={slashMenu}
          onSelect={(cmd) => {
            if (!editor) return
            cmd.command({ editor, range: slashMenu.range })
            setSlashMenu(null)
          }}
        />
      )}
      {showFooter && (
        <div
          data-slot="text-editor-footer"
          className={cn(
            'border-border text-muted-foreground text-body-sm flex items-center justify-between border-t px-3 py-1.5 tabular-nums',
            classNames?.footer
          )}
        >
          <span>
            {showWordCount &&
              `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
          </span>
          <span>
            {maxLength !== undefined && `${charCount} / ${maxLength}`}
          </span>
        </div>
      )}
    </div>
  )

  if (label || errorMessage) {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <Label
            htmlFor={id}
            size={size}
            required={required}
            hint={hint}
            hintIcon={hintIcon}
            className={classNames?.label}
          >
            {label}
          </Label>
        )}
        {editorEl}
        {errorMessage && (
          <p className={cn('text-body-sm text-destructive', classNames?.error)}>
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  return editorEl
}

export {
  TextEditor,
  textEditorVariants,
  type ITextEditorProps,
  type ITextEditorClassNames,
}
