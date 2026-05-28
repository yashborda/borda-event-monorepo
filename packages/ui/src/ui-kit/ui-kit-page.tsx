'use client'

import {
  IconArrowRight,
  IconCheck,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'

import { Suspense, lazy } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../components/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'
import { FileUpload } from '../components/ui/file-upload'
import { Input } from '../components/ui/input'
import { MultiSelect } from '../components/ui/multi-select'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio'
import { Select } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { TagInput } from '../components/ui/tag-input'
import { TextEditor } from '../components/ui/text-editor'
import { Textarea } from '../components/ui/textarea'
import { toast } from '../lib/toast'
import { cn } from '../lib/utils'

type IVariant = 'website' | 'admin'

export type IUiKitPageProps = {
  variant?: IVariant
}

const colors = [
  {
    name: 'Primary',
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    label: '--primary',
  },
  {
    name: 'Secondary',
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    label: '--secondary',
  },
  {
    name: 'Accent',
    bg: 'bg-accent',
    text: 'text-accent-foreground',
    label: '--accent',
  },
  {
    name: 'Background',
    bg: 'bg-background',
    text: 'text-foreground',
    label: '--background',
    border: true,
  },
  {
    name: 'Foreground',
    bg: 'bg-foreground',
    text: 'text-background',
    label: '--foreground',
  },
  {
    name: 'Muted',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    label: '--muted',
  },
  {
    name: 'Destructive',
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
    label: '--destructive',
  },
  {
    name: 'Success',
    bg: 'bg-success',
    text: 'text-success-foreground',
    label: '--success',
  },
  {
    name: 'Warning',
    bg: 'bg-warning',
    text: 'text-warning-foreground',
    label: '--warning',
  },
  {
    name: 'Info',
    bg: 'bg-info',
    text: 'text-info-foreground',
    label: '--info',
  },
]

const navItems = [
  ['color-palette', 'Color Palette'],
  ['typography', 'Typography'],
  ['buttons', 'Buttons'],
  ['badges', 'Badges'],
  ['inputs', 'Inputs'],
  ['tag-input', 'Tag Input'],
  ['textarea', 'Textarea'],
  ['text-editor', 'Text Editor'],
  ['checkbox', 'Checkbox'],
  ['radio', 'Radio'],
  ['file-upload', 'File Upload'],
  ['switch', 'Switch'],
  ['multi-select', 'Multi Select'],
  ['select', 'Single Select'],
  ['toaster', 'Toaster'],
  ['dialog', 'Dialog'],
]

const LazyDialogSection = lazy(() => import('./ui-dialog-section'))

const configs = {
  website: {
    outerClass: 'bg-background min-h-screen px-6 py-12',
    containerClass: 'container mx-auto flex flex-col gap-8',
    contentClass: 'flex min-w-0 flex-1 flex-col gap-16',
    sectionClass: 'flex scroll-mt-8 flex-col gap-6',
    headerClass: 'flex items-start justify-between',
    descriptionClass: 'text-body-lg text-muted-foreground mt-2',
    colorGridClass: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
    colorCardClass: (border?: boolean) =>
      cn(
        'flex flex-col gap-3 rounded-xl p-5',
        border && 'border border-foreground/10'
      ),
  },
  admin: {
    outerClass: 'bg-background min-h-screen p-8',
    containerClass: 'mx-auto flex max-w-5xl flex-col gap-8',
    contentClass: 'flex min-w-0 flex-1 flex-col gap-12',
    sectionClass: 'flex scroll-mt-8 flex-col gap-4',
    headerClass: 'flex items-center justify-between',
    descriptionClass: 'text-body-md text-muted-foreground mt-1',
    colorGridClass: 'grid grid-cols-2 gap-3 sm:grid-cols-4',
    colorCardClass: (border?: boolean) =>
      cn(
        'flex flex-col gap-2 rounded-lg p-4',
        border && 'border border-foreground/10'
      ),
  },
}

const WebsiteTypography = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Display</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['display-2xl', '56px / 64px · 700', 'text-display-2xl'],
          ['display-xl', '44px / 52px · 500', 'text-display-xl'],
          ['display-lg', '34px / 42px · 500', 'text-display-lg'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>The quick brown fox</p>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Headings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['heading-2xl', '42px / 50px · 700', 'text-heading-2xl'],
          ['heading-xl', '32px / 40px · 700', 'text-heading-xl'],
          ['heading-lg', '26px / 34px · 600', 'text-heading-lg'],
          ['heading-md', '22px / 30px · 600', 'text-heading-md'],
          ['heading-sm', '18px / 26px · 600', 'text-heading-sm'],
          ['heading-xs', '16px / 24px · 600', 'text-heading-xs'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>
              The quick brown fox jumps
            </p>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Body</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['body-xl', '18px / 28px', 'text-body-xl'],
          ['body-lg', '16px / 26px', 'text-body-lg'],
          ['body-md', '14px / 20px', 'text-body-md'],
          ['body-sm', '12px / 16px', 'text-body-sm'],
          ['body-xs', '10px / 14px', 'text-body-xs'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['label-md', '12px / 20px · uppercase', 'text-label-md'],
          ['label-sm', '10px / 20px · uppercase', 'text-label-sm'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>Category Label</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </>
)

const AdminTypography = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Headings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['heading-2xl', '30px / 38px · 700', 'text-heading-2xl'],
          ['heading-xl', '24px / 32px · 600', 'text-heading-xl'],
          ['heading-lg', '20px / 28px · 600', 'text-heading-lg'],
          ['heading-md', '16px / 24px · 600', 'text-heading-md'],
          ['heading-sm', '14px / 20px · 600', 'text-heading-sm'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>Dashboard overview</p>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Body</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['body-lg', '16px / 24px', 'text-body-lg'],
          ['body-md', '14px / 20px', 'text-body-md'],
          ['body-sm', '12px / 16px', 'text-body-sm'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[
          ['label-lg', '14px / 20px · uppercase', 'text-label-lg'],
          ['label-md', '12px / 16px · uppercase', 'text-label-md'],
          ['label-sm', '10px / 16px · uppercase', 'text-label-sm'],
        ].map(([name, meta, cls]) => (
          <div key={name}>
            <span className="text-label-md text-muted-foreground mb-1 block">
              {name} · {meta}
            </span>
            <p className={`${cls} text-foreground`}>Table Header</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </>
)

export const UiKitPage = ({ variant = 'website' }: IUiKitPageProps) => {
  const c = configs[variant]

  return (
    <div className={c.outerClass}>
      <div className={c.containerClass}>
        {/* Header */}
        <div className={c.headerClass}>
          <div>
            <h1 className="text-heading-2xl text-foreground">UI Kit</h1>
            <p className={c.descriptionClass}>
              Design tokens, typography and components
            </p>
          </div>
        </div>

        <div className="flex items-start gap-8">
          {/* Page nav */}
          <aside className="sticky top-8 hidden w-44 shrink-0 lg:block">
            <nav className="flex flex-col gap-0.5">
              <p className="text-label-md text-muted-foreground mb-2">
                On this page
              </p>
              {navItems.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-body-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded px-2 py-1 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className={c.contentClass}>
            {/* Color Palette */}
            <section id="color-palette" className={c.sectionClass}>
              <h2 className="text-heading-xl text-foreground">Color Palette</h2>
              <div className={c.colorGridClass}>
                {colors.map(({ name, bg, text, label, border }) => (
                  <div
                    key={name}
                    className={`${c.colorCardClass(border)} ${bg}`}
                  >
                    <span className={`text-body-sm ${text}`}>{name}</span>
                    <span className={`text-label-sm ${text} opacity-70`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section id="typography" className={c.sectionClass}>
              <h2 className="text-heading-xl text-foreground">Typography</h2>
              {variant === 'website' ? (
                <WebsiteTypography />
              ) : (
                <AdminTypography />
              )}
            </section>

            {/* Buttons */}
            <section id="buttons" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Buttons</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/buttons">More Buttons</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Solid</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="info">Info</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outline</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="outline">Default</Button>
                  <Button variant="outline-secondary">Secondary</Button>
                  <Button variant="outline-accent">Accent</Button>
                  <Button variant="outline-destructive">Destructive</Button>
                  <Button variant="outline-success">Success</Button>
                  <Button variant="outline-warning">Warning</Button>
                  <Button variant="outline-info">Info</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ghost</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="ghost">Default</Button>
                  <Button variant="ghost-secondary">Secondary</Button>
                  <Button variant="ghost-accent">Accent</Button>
                  <Button variant="ghost-destructive">Destructive</Button>
                  <Button variant="ghost-success">Success</Button>
                  <Button variant="ghost-warning">Warning</Button>
                  <Button variant="ghost-info">Info</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Link</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="link">Default</Button>
                  <Button variant="link-secondary">Secondary</Button>
                  <Button variant="link-accent">Accent</Button>
                  <Button variant="link-destructive">Destructive</Button>
                  <Button variant="link-success">Success</Button>
                  <Button variant="link-warning">Warning</Button>
                  <Button variant="link-info">Info</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sizes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Button size="xl">X-Large</Button>
                  <Button size="lg">Large</Button>
                  <Button>Default</Button>
                  <Button size="sm">Small</Button>
                  <Button size="icon">
                    <IconPlus />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shape</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Button>Default</Button>
                  <Button shape="pill">Pill</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="outline" shape="pill">
                    Outline Pill
                  </Button>
                  <Button size="icon" shape="pill">
                    <IconPlus />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Icon</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Button icon={<IconPlus />}>Icon Start</Button>
                  <Button icon={<IconArrowRight />} iconPosition="end">
                    Icon End
                  </Button>
                  <Button variant="outline" icon={<IconPlus />}>
                    Outline
                  </Button>
                  <Button variant="success" icon={<IconCheck />}>
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    icon={<IconTrash />}
                    iconPosition="end"
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    shape="pill"
                    variant="accent"
                    icon={<IconPlus />}
                  >
                    Pill + Icon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>
                    Outline Disabled
                  </Button>
                  <Button variant="secondary" disabled>
                    Secondary Disabled
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Badges */}
            <section id="badges" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Badges</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/badges">More Badges</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Solid</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ghost</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Badge variant="ghost">Default</Badge>
                  <Badge variant="ghost-secondary">Secondary</Badge>
                  <Badge variant="ghost-accent">Accent</Badge>
                  <Badge variant="ghost-destructive">Destructive</Badge>
                  <Badge variant="ghost-success">Success</Badge>
                  <Badge variant="ghost-warning">Warning</Badge>
                  <Badge variant="ghost-info">Info</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outline</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Badge variant="outline">Default</Badge>
                  <Badge variant="outline-secondary">Secondary</Badge>
                  <Badge variant="outline-accent">Accent</Badge>
                  <Badge variant="outline-destructive">Destructive</Badge>
                  <Badge variant="outline-success">Success</Badge>
                  <Badge variant="outline-warning">Warning</Badge>
                  <Badge variant="outline-info">Info</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shape</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Badge>Default</Badge>
                  <Badge shape="pill">Pill</Badge>
                  <Badge variant="outline">Default</Badge>
                  <Badge variant="outline" shape="pill">
                    Pill
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sizes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Badge size="sm">Small</Badge>
                  <Badge>Default</Badge>
                  <Badge size="lg">Large</Badge>
                  <Badge variant="outline" size="sm">
                    Small
                  </Badge>
                  <Badge variant="outline">Default</Badge>
                  <Badge variant="outline" size="lg">
                    Large
                  </Badge>
                </CardContent>
              </Card>
            </section>

            {/* Inputs */}
            <section id="inputs" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Inputs</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/input">More Inputs</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sizes</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <Input
                    id="kit-size-sm"
                    size="sm"
                    label="Username"
                    placeholder="Small input"
                  />
                  <Input
                    id="kit-size-default"
                    label="Username"
                    placeholder="Default input"
                  />
                  <Input
                    id="kit-size-lg"
                    size="lg"
                    label="Username"
                    placeholder="Large input"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <Input
                    id="kit-state-default"
                    label="Username"
                    placeholder="Default input"
                  />
                  <Input
                    id="kit-state-disabled"
                    label="Username"
                    placeholder="Disabled input"
                    disabled
                  />
                  <Input
                    id="kit-state-invalid"
                    label="Email"
                    placeholder="Invalid input"
                    aria-invalid="true"
                  />
                  <Input
                    id="kit-state-required"
                    label="Email"
                    placeholder="Required input"
                    required
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <Input
                    id="kit-password"
                    type="password"
                    label="Password"
                    placeholder="Enter password…"
                  />
                </CardContent>
              </Card>
            </section>

            {/* Tag Input */}
            <section id="tag-input" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Tag Input</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/tag-input">More Tag Input</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sizes</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <TagInput
                    id="kit-tag-sm"
                    size="sm"
                    label="Tags"
                    placeholder="Small — press Enter to add…"
                  />
                  <TagInput
                    id="kit-tag-default"
                    label="Tags"
                    placeholder="Default — press Enter to add…"
                  />
                  <TagInput
                    id="kit-tag-lg"
                    size="lg"
                    label="Tags"
                    placeholder="Large — press Enter to add…"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pre-filled &amp; clearable</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <TagInput
                    id="kit-tag-prefilled"
                    label="Skills"
                    defaultValue={['react', 'typescript', 'tailwind']}
                    placeholder="Add more…"
                    clearable
                  />
                  <TagInput
                    id="kit-tag-error"
                    label="Tags"
                    defaultValue={['one']}
                    errorMessage="Please add at least 3 tags."
                    clearable
                  />
                </CardContent>
              </Card>
            </section>

            {/* Textarea */}
            <section id="textarea" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Textarea</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/textarea">More Textarea</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <Textarea
                    id="kit-textarea"
                    label="Message"
                    placeholder="Enter your message…"
                  />
                  <Textarea
                    id="kit-textarea-required"
                    label="Message"
                    placeholder="Required field…"
                    required
                  />
                  <Textarea
                    id="kit-textarea-disabled"
                    label="Message"
                    placeholder="Disabled"
                    disabled
                  />
                  <Textarea
                    id="kit-textarea-invalid"
                    label="Message"
                    placeholder="Invalid"
                    aria-invalid="true"
                  />
                </CardContent>
              </Card>
            </section>

            {/* Text Editor */}
            <section id="text-editor" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Text Editor</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/text-editor">More Text Editor</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 pt-6">
                  <TextEditor
                    id="kit-text-editor"
                    label="Message"
                    placeholder="Enter your message…"
                  />
                  <TextEditor
                    id="kit-text-editor-required"
                    label="Message"
                    placeholder="Required field…"
                    required
                  />
                  <TextEditor
                    id="kit-text-editor-disabled"
                    label="Message"
                    placeholder="Disabled"
                    disabled
                  />
                  <TextEditor
                    id="kit-text-editor-error"
                    label="Message"
                    defaultValue="<p>x</p>"
                    errorMessage="Message must be at least 20 characters."
                  />
                </CardContent>
              </Card>
            </section>

            {/* Checkbox */}
            <section id="checkbox" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Checkbox</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/checkbox">More Checkbox</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-6">
                  <Checkbox id="kit-checkbox" label="Unchecked" />
                  <Checkbox
                    id="kit-checkbox-checked"
                    label="Checked"
                    defaultChecked
                  />
                  <Checkbox
                    id="kit-checkbox-indeterminate"
                    label="Indeterminate"
                    checked="indeterminate"
                  />
                  <Checkbox
                    id="kit-checkbox-disabled"
                    label="Disabled"
                    disabled
                  />
                </CardContent>
              </Card>
            </section>

            {/* Radio */}
            <section id="radio" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Radio</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/radio">More Radio</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup defaultValue="option-a">
                    <RadioGroupItem
                      id="kit-radio-a"
                      value="option-a"
                      label="Option A"
                    />
                    <RadioGroupItem
                      id="kit-radio-b"
                      value="option-b"
                      label="Option B"
                    />
                    <RadioGroupItem
                      id="kit-radio-c"
                      value="option-c"
                      label="Option C (disabled)"
                      disabled
                    />
                  </RadioGroup>
                </CardContent>
              </Card>
            </section>

            {/* File Upload */}
            <section id="file-upload" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">File Upload</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/file-upload">More File Upload</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <FileUpload id="kit-file" label="Attachment" />
                  <FileUpload
                    id="kit-file-required"
                    label="Attachment"
                    required
                  />
                  <FileUpload
                    id="kit-file-disabled"
                    label="Attachment"
                    disabled
                  />
                </CardContent>
              </Card>
            </section>

            {/* Switch */}
            <section id="switch" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Switch</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/switch">More Switch</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-6">
                  <Switch id="kit-switch-off" label="Off" />
                  <Switch id="kit-switch-on" label="On" defaultChecked />
                  <Switch id="kit-switch-disabled" label="Disabled" disabled />
                </CardContent>
              </Card>
            </section>

            {/* Multi Select */}
            <section id="multi-select" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">
                  Multi Select
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/multi-select">More Multi Select</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <MultiSelect
                    id="kit-multi-select"
                    label="Fruits"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                      { label: 'Cherry', value: 'cherry' },
                      { label: 'Date', value: 'date' },
                      { label: 'Elderberry', value: 'elderberry' },
                    ]}
                    placeholder="Select fruits…"
                  />
                  <MultiSelect
                    id="kit-multi-select-required"
                    label="Fruits"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                      { label: 'Cherry', value: 'cherry' },
                    ]}
                    placeholder="Select fruits…"
                    required
                  />
                  <MultiSelect
                    id="kit-multi-select-disabled"
                    label="Fruits"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                    ]}
                    placeholder="Select fruits…"
                    disabled
                  />
                  <MultiSelect
                    id="kit-multi-select-error"
                    label="Fruits"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                    ]}
                    errorMessage="Please select at least one fruit."
                  />
                </CardContent>
              </Card>
            </section>

            {/* Single Select */}
            <section id="select" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">
                  Single Select
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/select">More Single Select</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>States</CardTitle>
                </CardHeader>
                <CardContent className="flex max-w-sm flex-col gap-3 pt-6">
                  <Select
                    id="kit-select"
                    label="Fruit"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                      { label: 'Cherry', value: 'cherry' },
                      { label: 'Date', value: 'date' },
                      { label: 'Elderberry', value: 'elderberry' },
                    ]}
                    placeholder="Select a fruit…"
                  />
                  <Select
                    id="kit-select-required"
                    label="Fruit"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                      { label: 'Cherry', value: 'cherry' },
                    ]}
                    placeholder="Select a fruit…"
                    required
                  />
                  <Select
                    id="kit-select-clearable"
                    label="Fruit"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                    ]}
                    defaultValue="apple"
                    placeholder="Select a fruit…"
                    clearable
                  />
                  <Select
                    id="kit-select-disabled"
                    label="Fruit"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                    ]}
                    placeholder="Select a fruit…"
                    disabled
                  />
                  <Select
                    id="kit-select-error"
                    label="Fruit"
                    options={[
                      { label: 'Apple', value: 'apple' },
                      { label: 'Banana', value: 'banana' },
                    ]}
                    errorMessage="Please select a fruit."
                  />
                </CardContent>
              </Card>
            </section>

            {/* Toaster */}
            <section id="toaster" className={c.sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-heading-xl text-foreground">Toaster</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconArrowRight />}
                  iconPosition="end"
                  asChild
                >
                  <a href="/ui-kit/toaster">More Toasts</a>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => toast.default('This is a default toast')}
                  >
                    Default
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => toast.success('Changes saved successfully')}
                  >
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error('Something went wrong')}
                  >
                    Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.warning('Your session is about to expire')
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => toast.info('New update available')}
                  >
                    Info
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Description</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      toast.default('Heads up', {
                        description: 'This toast includes a description.',
                      })
                    }
                  >
                    Default
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast.success('Profile updated', {
                        description: 'Your changes have been saved.',
                      })
                    }
                  >
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      toast.error('Upload failed', {
                        description: 'The file exceeds the 10 MB limit.',
                      })
                    }
                  >
                    Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.warning('Storage almost full', {
                        description: 'You have used 90% of your quota.',
                      })
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast.info('Maintenance scheduled', {
                        description: 'Downtime expected on Sunday at 2 AM.',
                      })
                    }
                  >
                    Info
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Action</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      toast.action('File deleted permanently', {
                        action: {
                          label: 'Undo',
                          onClick: () => toast.success('Deletion undone'),
                        },
                        cancelLabel: 'Dismiss',
                      })
                    }
                  >
                    Default
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast.success('Item archived', {
                        action: {
                          label: 'Undo',
                          onClick: () => toast.info('Archive reverted'),
                        },
                      })
                    }
                  >
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      toast.error('Payment declined', {
                        action: {
                          label: 'Retry',
                          onClick: () => toast.info('Retrying payment…'),
                        },
                      })
                    }
                  >
                    Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.warning('Session expiring', {
                        action: {
                          label: 'Stay logged in',
                          onClick: () => toast.success('Session extended'),
                        },
                      })
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast.info('New version available', {
                        action: {
                          label: 'Update',
                          onClick: () => toast.success('Updating…'),
                        },
                      })
                    }
                  >
                    Info
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Close Button</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      toast.default('Default toast', { closeButton: true })
                    }
                  >
                    Default
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast.success('Changes saved', { closeButton: true })
                    }
                  >
                    Success
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      toast.error('Something went wrong', { closeButton: true })
                    }
                  >
                    Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.warning('Session about to expire', {
                        closeButton: true,
                      })
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast.info('Update available', { closeButton: true })
                    }
                  >
                    Info
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promise</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.promise(
                        new Promise((resolve) => setTimeout(resolve, 2000)),
                        {
                          loading: 'Saving…',
                          success: 'Saved successfully!',
                          error: 'Failed to save',
                        }
                      )
                    }
                  >
                    Resolves
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.promise(
                        new Promise((_, reject) => setTimeout(reject, 2000)),
                        {
                          loading: 'Deleting…',
                          success: 'Deleted!',
                          error: 'Failed to delete',
                        }
                      )
                    }
                  >
                    Rejects
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dismiss</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.default('Toast 1')
                      toast.success('Toast 2')
                      toast.error('Toast 3')
                    }}
                  >
                    Spawn 3 Toasts
                  </Button>
                  <Button variant="destructive" onClick={() => toast.dismiss()}>
                    Dismiss All
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Dialog */}
            <Suspense
              fallback={<section id="dialog" className={c.sectionClass} />}
            >
              <LazyDialogSection sectionClass={c.sectionClass} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
