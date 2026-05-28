'use client'

import {
  IconArrowLeft,
  IconBolt,
  IconCheck,
  IconStar,
} from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Badge } from '../components/ui/badge'
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

type IBadgeVariant =
  | (typeof solidVariants)[number]
  | (typeof ghostVariants)[number]
  | (typeof outlineVariants)[number]
type IBadgeSize = 'sm' | 'default' | 'lg'
type IBadgeShape = 'default' | 'pill'

const sizes: IBadgeSize[] = ['sm', 'default', 'lg']
const shapes: IBadgeShape[] = ['default', 'pill']

const label = (v: string) =>
  v
    .replace(/^(outline|ghost)-/, '')
    .replace(/^(outline|ghost)$/, 'default')
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
  variants: readonly IBadgeVariant[]
  columns: string[]
  renderCell: (v: IBadgeVariant, col: string) => ReactNode
}) => (
  <div className="flex flex-col gap-2">
    <SubTitle>{title}</SubTitle>
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="text-body-md w-full">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="text-muted-foreground text-label-sm px-4 py-2 text-left">
              Variant
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

export const UiBadgesPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Badge Testing</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All variant × prop combinations
          </p>
        </div>
      </div>

      {/* ── Variant × Size ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Variant × Size</SectionTitle>
        <MatrixTable
          title="Solid"
          variants={solidVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Badge variant={v} size={size as IBadgeSize}>
              {label(v)}
            </Badge>
          )}
        />
        <MatrixTable
          title="Ghost"
          variants={ghostVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Badge variant={v} size={size as IBadgeSize}>
              {label(v)}
            </Badge>
          )}
        />
        <MatrixTable
          title="Outline"
          variants={outlineVariants}
          columns={sizes}
          renderCell={(v, size) => (
            <Badge variant={v} size={size as IBadgeSize}>
              {label(v)}
            </Badge>
          )}
        />
      </section>

      {/* ── Variant × Shape ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Variant × Shape</SectionTitle>
        <MatrixTable
          title="Solid"
          variants={solidVariants}
          columns={shapes}
          renderCell={(v, shape) => (
            <Badge variant={v} shape={shape as IBadgeShape}>
              {label(v)}
            </Badge>
          )}
        />
        <MatrixTable
          title="Ghost"
          variants={ghostVariants}
          columns={shapes}
          renderCell={(v, shape) => (
            <Badge variant={v} shape={shape as IBadgeShape}>
              {label(v)}
            </Badge>
          )}
        />
        <MatrixTable
          title="Outline"
          variants={outlineVariants}
          columns={shapes}
          renderCell={(v, shape) => (
            <Badge variant={v} shape={shape as IBadgeShape}>
              {label(v)}
            </Badge>
          )}
        />
      </section>

      {/* ── Variant × Content ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Variant × Content</SectionTitle>
        <MatrixTable
          title="Solid"
          variants={solidVariants}
          columns={['label only', 'with icon start', 'with icon end']}
          renderCell={(v, col) => {
            if (col === 'with icon start')
              return (
                <Badge variant={v}>
                  <IconStar />
                  {label(v)}
                </Badge>
              )
            if (col === 'with icon end')
              return (
                <Badge variant={v}>
                  {label(v)}
                  <IconCheck />
                </Badge>
              )
            return <Badge variant={v}>{label(v)}</Badge>
          }}
        />
        <MatrixTable
          title="Ghost"
          variants={ghostVariants}
          columns={['label only', 'with icon start', 'with icon end']}
          renderCell={(v, col) => {
            if (col === 'with icon start')
              return (
                <Badge variant={v}>
                  <IconStar />
                  {label(v)}
                </Badge>
              )
            if (col === 'with icon end')
              return (
                <Badge variant={v}>
                  {label(v)}
                  <IconCheck />
                </Badge>
              )
            return <Badge variant={v}>{label(v)}</Badge>
          }}
        />
        <MatrixTable
          title="Outline"
          variants={outlineVariants}
          columns={['label only', 'with icon start', 'with icon end']}
          renderCell={(v, col) => {
            if (col === 'with icon start')
              return (
                <Badge variant={v}>
                  <IconStar />
                  {label(v)}
                </Badge>
              )
            if (col === 'with icon end')
              return (
                <Badge variant={v}>
                  {label(v)}
                  <IconCheck />
                </Badge>
              )
            return <Badge variant={v}>{label(v)}</Badge>
          }}
        />
      </section>

      {/* ── Common Semantic Combos ── */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Common Semantic Combos</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success" size="lg">
            <IconCheck />
            Active
          </Badge>
          <Badge variant="destructive">Deleted</Badge>
          <Badge variant="warning" size="sm">
            <IconBolt />
            Beta
          </Badge>
          <Badge variant="outline-info">v2.0.0</Badge>
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="accent" size="lg">
            <IconStar />
            Featured
          </Badge>
          <Badge variant="outline-success">
            <IconCheck />
            Verified
          </Badge>
          <Badge variant="outline-destructive" size="sm">
            Deprecated
          </Badge>
          <Badge variant="muted">Archived</Badge>
          <Badge variant="ghost-muted" size="sm">
            Inactive
          </Badge>
          <Badge variant="outline-muted">Disabled</Badge>
        </div>
      </section>
    </div>
  </div>
)
