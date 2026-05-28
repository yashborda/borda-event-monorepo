'use client'

import { IconArrowLeft, IconLock } from '@tabler/icons-react'

import type { ReactNode } from 'react'
import * as React from 'react'

import { Button } from '../components/ui/button'
import {
  type IMultiSelectOption,
  MultiSelect,
} from '../components/ui/multi-select'

type ISize = 'sm' | 'default' | 'lg'

const sizes: ISize[] = ['sm', 'default', 'lg']

const fruitsOptions: IMultiSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
]

const techOptions: IMultiSelectOption[] = [
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Prisma', value: 'prisma', disabled: true },
  { label: 'tRPC', value: 'trpc' },
  { label: 'Drizzle', value: 'drizzle' },
  { label: 'Zod', value: 'zod' },
]

const roleOptions: IMultiSelectOption[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Billing', value: 'billing' },
  { label: 'Support', value: 'support' },
]

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

const ControlledExample = () => {
  const [value, setValue] = React.useState<string[]>(['react', 'typescript'])

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <MultiSelect
        id="controlled"
        label="Technologies"
        options={techOptions}
        value={value}
        onChange={setValue}
        placeholder="Select technologies…"
      />
      <p className="text-muted-foreground text-body-sm">
        Selected:{' '}
        <span className="text-foreground font-mono">
          {value.length ? value.join(', ') : '—'}
        </span>
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setValue([])}>
          Clear
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setValue(['react', 'typescript', 'tailwind'])}
        >
          Preset
        </Button>
      </div>
    </div>
  )
}

export const UiMultiSelectPage = () => (
  <div className="bg-background min-h-screen p-8">
    <div className="mx-auto flex max-w-3xl flex-col gap-12">
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
          <h1 className="text-heading-2xl text-foreground">Multi Select</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size × state combinations for the multi-select dropdown
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <div key={size} className="flex items-start gap-4">
              <span className="text-muted-foreground text-body-sm w-16 pt-2 font-mono">
                {size}
              </span>
              <MultiSelect
                size={size}
                options={fruitsOptions}
                placeholder="Select fruits…"
                className="max-w-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Size × State matrix */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Size × State</SectionTitle>
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="text-body-md w-full">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="text-muted-foreground text-label-sm px-4 py-2 text-left">
                  State
                </th>
                {sizes.map((s) => (
                  <th
                    key={s}
                    className="text-muted-foreground text-label-sm px-4 py-2 text-left"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  {
                    label: 'Empty',
                    props: {},
                  },
                  {
                    label: 'Pre-selected',
                    props: { defaultValue: ['apple', 'cherry'] },
                  },
                  {
                    label: 'Disabled',
                    props: { disabled: true },
                  },
                  {
                    label: 'Error',
                    props: { errorMessage: 'Required' },
                  },
                ] as { label: string; props: object }[]
              ).map(({ label, props }) => (
                <tr
                  key={label}
                  className="border-border border-b last:border-0"
                >
                  <td className="text-muted-foreground text-body-sm px-4 py-3 font-mono">
                    {label}
                  </td>
                  {sizes.map((s) => (
                    <td key={s} className="px-4 py-3">
                      <MultiSelect
                        size={s}
                        options={fruitsOptions}
                        placeholder="Select…"
                        className="min-w-[160px]"
                        {...props}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Label Prop */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Label Prop</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default</SubTitle>
          <MultiSelect
            id="label-default"
            label="Fruits"
            options={fruitsOptions}
            placeholder="Select fruits…"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <MultiSelect
            id="label-required"
            label="Technologies"
            options={techOptions}
            placeholder="Select technologies…"
            required
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <MultiSelect
            id="label-disabled"
            label="Fruits"
            options={fruitsOptions}
            placeholder="Select fruits…"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <MultiSelect
            id="label-error"
            label="Technologies"
            options={techOptions}
            errorMessage="Please select at least one technology."
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Pre-selected */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Pre-selected Values</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Uncontrolled (defaultValue)</SubTitle>
          <MultiSelect
            id="pre-selected"
            label="Fruits"
            options={fruitsOptions}
            defaultValue={['apple', 'cherry', 'grape']}
            placeholder="Select fruits…"
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Controlled */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Controlled</SectionTitle>
        <div className="flex flex-col gap-4">
          <SubTitle>value + onChange</SubTitle>
          <ControlledExample />
        </div>
      </section>

      {/* Max Display */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Max Display</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>maxDisplay={2} — default label</SubTitle>
          <MultiSelect
            id="max-display-default"
            label="Fruits"
            options={fruitsOptions}
            defaultValue={['apple', 'banana', 'cherry']}
            maxDisplay={2}
            placeholder="Select fruits…"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>maxDisplay={2} — custom overflowLabel</SubTitle>
          <MultiSelect
            id="max-display-custom"
            label="Fruits"
            options={fruitsOptions}
            defaultValue={['apple', 'banana', 'cherry', 'date']}
            maxDisplay={2}
            overflowLabel={(n) => `+${n} selected`}
            placeholder="Select fruits…"
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Select / Deselect All */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Select / Deselect All</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Select all only</SubTitle>
          <MultiSelect
            id="select-all"
            label="Fruits"
            options={fruitsOptions}
            placeholder="Select fruits…"
            selectAll
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Deselect all only</SubTitle>
          <MultiSelect
            id="deselect-all"
            label="Fruits"
            options={fruitsOptions}
            defaultValue={['apple', 'banana']}
            placeholder="Select fruits…"
            deselectAll
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Both</SubTitle>
          <MultiSelect
            id="select-deselect-all"
            label="Technologies"
            options={techOptions}
            placeholder="Select technologies…"
            selectAll
            deselectAll
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Both + searchable</SubTitle>
          <MultiSelect
            id="select-all-searchable"
            label="Technologies"
            options={techOptions}
            placeholder="Select technologies…"
            selectAll
            deselectAll
            searchable
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Searchable */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Searchable</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>With search input</SubTitle>
          <MultiSelect
            id="searchable"
            label="Technologies"
            options={techOptions}
            placeholder="Select technologies…"
            searchable
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Searchable + pre-selected</SubTitle>
          <MultiSelect
            id="searchable-pre"
            label="Technologies"
            options={techOptions}
            defaultValue={['react', 'zod']}
            placeholder="Select technologies…"
            searchable
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Disabled options */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Disabled Options</SectionTitle>
        <MultiSelect
          id="disabled-options"
          label="Technologies"
          options={techOptions}
          placeholder="Select technologies…"
          className="max-w-sm"
        />
        <p className="text-muted-foreground text-body-md">
          &quot;Prisma&quot; is disabled in this list.
        </p>
      </section>

      {/* Group / real-world */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Real-world Example</SectionTitle>
        <div className="flex flex-col gap-4">
          <SubTitle>User role assignment</SubTitle>
          <div className="flex max-w-sm flex-col gap-3">
            <MultiSelect
              id="roles"
              label="Roles"
              options={roleOptions}
              placeholder="Assign roles…"
              required
            />
            <MultiSelect
              id="permissions"
              label="Technologies"
              options={techOptions}
              placeholder="Select stack…"
              searchable
            />
          </div>
        </div>
      </section>

      {/* Hint */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Hint</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default icon (Info)</SubTitle>
          <MultiSelect
            id="hint-default"
            label="Notification channels"
            options={roleOptions}
            placeholder="Select channels…"
            hint="Choose all the channels where you'd like to receive alerts."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Custom icon</SubTitle>
          <MultiSelect
            id="hint-custom"
            label="Admin permissions"
            options={roleOptions}
            placeholder="Select permissions…"
            hint="These permissions grant elevated access. Use with caution."
            hintIcon={<IconLock className="text-muted-foreground size-3.5" />}
            className="max-w-sm"
          />
        </div>
      </section>
    </div>
  </div>
)
