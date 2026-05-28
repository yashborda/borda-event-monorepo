'use client'

import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconLoader2,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'

const solidVariants = [
  'default',
  'secondary',
  'accent',
  'destructive',
  'success',
  'warning',
  'info',
  'muted',
] as const

const outlineVariants = [
  'outline',
  'outline-secondary',
  'outline-accent',
  'outline-destructive',
  'outline-success',
  'outline-warning',
  'outline-info',
  'outline-muted',
] as const

const ghostVariants = [
  'ghost',
  'ghost-secondary',
  'ghost-accent',
  'ghost-destructive',
  'ghost-success',
  'ghost-warning',
  'ghost-info',
  'ghost-muted',
] as const

const linkVariants = [
  'link',
  'link-secondary',
  'link-accent',
  'link-destructive',
  'link-success',
  'link-warning',
  'link-info',
  'link-muted',
] as const

const allVariants = [
  ...solidVariants,
  ...outlineVariants,
  ...ghostVariants,
  ...linkVariants,
] as const

type IVariant = (typeof allVariants)[number]
type ISize = 'sm' | 'default' | 'lg' | 'xl'
type IShape = 'default' | 'pill'

const sizes: ISize[] = ['sm', 'default', 'lg', 'xl']
const shapes: IShape[] = ['default', 'pill']

const label = (v: string) =>
  v
    .replace(/^(outline|ghost|link)-/, '')
    .replace(/^(outline|ghost|link)$/, 'default')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Default'

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

const MatrixTable = ({
  title,
  variants,
  columns,
  renderCell,
}: {
  title: string
  variants: readonly IVariant[]
  columns: string[]
  renderCell: (v: IVariant, col: string) => ReactNode
}) => (
  <div className="flex flex-col gap-2">
    <SubTitle>{title}</SubTitle>
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="text-body-md w-full">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="text-muted-foreground text-label-sm px-4 py-2 text-left">
              IVariant
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="text-muted-foreground text-label-sm px-4 py-2 text-left"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v} className="border-border border-b last:border-0">
              <td className="text-muted-foreground text-body-sm px-4 py-3 font-mono">
                {v}
              </td>
              {columns.map((col) => (
                <td key={col} className="px-4 py-3">
                  {renderCell(v, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const UiButtonsPage = () => (
  <div className="bg-background min-h-screen p-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<IconArrowLeft />}
          className="w-fit"
          asChild
        >
          <a href="/ui-kit">Back to UI Kit</a>
        </Button>
        <div>
          <h1 className="text-heading-2xl text-foreground">Button Testing</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All variant × prop combinations
          </p>
        </div>
      </div>

      {/* ── IVariant × Size ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>IVariant × Size</SectionTitle>
        <MatrixTable
          title="Solid"
          variants={solidVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Button variant={v} size={size as ISize}>
              {label(v)}
            </Button>
          )}
        />
        <MatrixTable
          title="Outline"
          variants={outlineVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Button variant={v} size={size as ISize}>
              {label(v)}
            </Button>
          )}
        />
        <MatrixTable
          title="Ghost"
          variants={ghostVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Button variant={v} size={size as ISize}>
              {label(v)}
            </Button>
          )}
        />
        <MatrixTable
          title="Link"
          variants={linkVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Button variant={v} size={size as ISize}>
              {label(v)}
            </Button>
          )}
        />
      </section>

      {/* ── IVariant × Shape ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>IVariant × Shape</SectionTitle>
        <MatrixTable
          title="Solid"
          variants={solidVariants}
          columns={shapes}
          renderCell={(v, shape) => (
            <Button variant={v} shape={shape as IShape}>
              {label(v)}
            </Button>
          )}
        />
        <MatrixTable
          title="Outline"
          variants={outlineVariants}
          columns={shapes}
          renderCell={(v, shape) => (
            <Button variant={v} shape={shape as IShape}>
              {label(v)}
            </Button>
          )}
        />
      </section>

      {/* ── IVariant × Icon Position ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>IVariant × Icon Position</SectionTitle>
        <MatrixTable
          title="Solid"
          variants={solidVariants}
          columns={['icon start', 'icon end', 'icon only']}
          renderCell={(v, col) => {
            if (col === 'icon start')
              return (
                <Button variant={v} icon={<IconPlus />}>
                  {label(v)}
                </Button>
              )
            if (col === 'icon end')
              return (
                <Button
                  variant={v}
                  icon={<IconArrowRight />}
                  iconPosition="end"
                >
                  {label(v)}
                </Button>
              )
            return (
              <Button variant={v} size="icon">
                <IconPlus />
              </Button>
            )
          }}
        />
        <MatrixTable
          title="Outline"
          variants={outlineVariants}
          columns={['icon start', 'icon end', 'icon only']}
          renderCell={(v, col) => {
            if (col === 'icon start')
              return (
                <Button variant={v} icon={<IconPlus />}>
                  {label(v)}
                </Button>
              )
            if (col === 'icon end')
              return (
                <Button
                  variant={v}
                  icon={<IconArrowRight />}
                  iconPosition="end"
                >
                  {label(v)}
                </Button>
              )
            return (
              <Button variant={v} size="icon">
                <IconPlus />
              </Button>
            )
          }}
        />
        <MatrixTable
          title="Ghost"
          variants={ghostVariants}
          columns={['icon start', 'icon end', 'icon only']}
          renderCell={(v, col) => {
            if (col === 'icon start')
              return (
                <Button variant={v} icon={<IconPlus />}>
                  {label(v)}
                </Button>
              )
            if (col === 'icon end')
              return (
                <Button
                  variant={v}
                  icon={<IconArrowRight />}
                  iconPosition="end"
                >
                  {label(v)}
                </Button>
              )
            return (
              <Button variant={v} size="icon">
                <IconPlus />
              </Button>
            )
          }}
        />
      </section>

      {/* ── IVariant × Disabled ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>IVariant × Disabled</SectionTitle>
        <MatrixTable
          title="All variants"
          variants={allVariants}
          columns={['enabled', 'disabled']}
          renderCell={(v, col) => (
            <Button variant={v} disabled={col === 'disabled'}>
              {label(v)}
            </Button>
          )}
        />
      </section>

      {/* ── Size × Shape ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Size × Shape</SectionTitle>
        <MatrixTable
          title="Default variant"
          variants={['default', 'outline', 'ghost'] as IVariant[]}
          columns={[
            'sm default',
            'sm pill',
            'default default',
            'default pill',
            'lg default',
            'lg pill',
            'xl default',
            'xl pill',
          ]}
          renderCell={(v, col) => {
            const [size, shape] = col.split(' ') as [ISize, IShape]
            return (
              <Button variant={v} size={size} shape={shape}>
                {label(v)}
              </Button>
            )
          }}
        />
      </section>

      {/* ── Loading / Icon states ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Loading State</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {solidVariants.map((v) => (
            <Button
              key={v}
              variant={v}
              icon={<IconLoader2 className="animate-spin" />}
              disabled
            >
              {label(v)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {outlineVariants.map((v) => (
            <Button
              key={v}
              variant={v}
              icon={<IconLoader2 className="animate-spin" />}
              disabled
            >
              {label(v)}
            </Button>
          ))}
        </div>
      </section>

      {/* ── Semantic combos ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Common Semantic Combos</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" icon={<IconCheck />}>
            Save
          </Button>
          <Button variant="outline" icon={<IconPlus />}>
            New
          </Button>
          <Button variant="destructive" icon={<IconTrash />} iconPosition="end">
            Delete
          </Button>
          <Button variant="success" icon={<IconCheck />} shape="pill">
            Approved
          </Button>
          <Button
            variant="warning"
            size="sm"
            icon={<IconArrowRight />}
            iconPosition="end"
          >
            Review
          </Button>
          <Button variant="ghost-destructive" size="sm" icon={<IconTrash />}>
            Remove
          </Button>
          <Button variant="outline-accent" shape="pill" size="lg">
            Upgrade
          </Button>
          <Button
            variant="link-info"
            icon={<IconArrowRight />}
            iconPosition="end"
          >
            Learn more
          </Button>
          <Button variant="muted" size="sm">
            Archive
          </Button>
          <Button
            variant="ghost-muted"
            size="sm"
            icon={<IconArrowRight />}
            iconPosition="end"
          >
            Skip
          </Button>
          <Button variant="outline-muted">Cancel</Button>
          <Button variant="link-muted">Dismiss</Button>
        </div>
      </section>
    </div>
  </div>
)
