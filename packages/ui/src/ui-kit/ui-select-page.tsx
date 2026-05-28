'use client'

import { IconArrowLeft, IconShieldExclamation } from '@tabler/icons-react'

import type { ReactNode } from 'react'
import * as React from 'react'

import { Button } from '../components/ui/button'
import { type ISelectOption, Select } from '../components/ui/select'

type ISize = 'sm' | 'default' | 'lg'

const sizes: ISize[] = ['sm', 'default', 'lg']

const fruitsOptions: ISelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
]

const techOptions: ISelectOption[] = [
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Tailwind CSS', value: 'tailwind' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Prisma', value: 'prisma', disabled: true },
  { label: 'tRPC', value: 'trpc' },
  { label: 'Drizzle', value: 'drizzle' },
  { label: 'Zod', value: 'zod' },
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
  const [value, setValue] = React.useState<string | null>('react')

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Select
        id="controlled"
        label="Technology"
        options={techOptions}
        value={value ?? undefined}
        onChange={setValue}
        placeholder="Select a technology…"
        clearable
      />
      <p className="text-muted-foreground text-body-sm">
        Selected:{' '}
        <span className="text-foreground font-mono">{value ?? '—'}</span>
      </p>
      <Button
        size="sm"
        variant="secondary"
        className="w-fit"
        onClick={() => setValue(null)}
      >
        Clear
      </Button>
    </div>
  )
}

export const UiSelectPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Single Select</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size × state combinations for the select dropdown
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="text-muted-foreground text-body-sm w-16 font-mono">
                {size}
              </span>
              <Select
                size={size}
                options={fruitsOptions}
                placeholder="Select a fruit…"
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
                  { label: 'Empty', props: {} },
                  { label: 'Pre-selected', props: { defaultValue: 'apple' } },
                  { label: 'Disabled', props: { disabled: true } },
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
                      <Select
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
          <Select
            id="label-default"
            label="Fruit"
            options={fruitsOptions}
            placeholder="Select a fruit…"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <Select
            id="label-required"
            label="Technology"
            options={techOptions}
            placeholder="Select a technology…"
            required
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <Select
            id="label-disabled"
            label="Fruit"
            options={fruitsOptions}
            placeholder="Select a fruit…"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <Select
            id="label-error"
            label="Technology"
            options={techOptions}
            errorMessage="Please select a technology."
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Clearable */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Clearable</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>With clear button</SubTitle>
          <Select
            id="clearable"
            label="Fruit"
            options={fruitsOptions}
            defaultValue="banana"
            placeholder="Select a fruit…"
            clearable
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Empty (clear button hidden when nothing selected)</SubTitle>
          <Select
            id="clearable-empty"
            label="Fruit"
            options={fruitsOptions}
            placeholder="Select a fruit…"
            clearable
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Pre-selected */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Pre-selected (defaultValue)</SectionTitle>
        <Select
          id="pre-selected"
          label="Fruit"
          options={fruitsOptions}
          defaultValue="cherry"
          placeholder="Select a fruit…"
          className="max-w-sm"
        />
      </section>

      {/* Controlled */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Controlled</SectionTitle>
        <div className="flex flex-col gap-4">
          <SubTitle>value + onChange</SubTitle>
          <ControlledExample />
        </div>
      </section>

      {/* Searchable */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Searchable</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>With search input</SubTitle>
          <Select
            id="searchable"
            label="Technology"
            options={techOptions}
            placeholder="Select a technology…"
            searchable
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Searchable + clearable</SubTitle>
          <Select
            id="searchable-clearable"
            label="Technology"
            options={techOptions}
            defaultValue="nextjs"
            placeholder="Select a technology…"
            searchable
            clearable
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Disabled options */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Disabled Options</SectionTitle>
        <Select
          id="disabled-options"
          label="Technology"
          options={techOptions}
          placeholder="Select a technology…"
          className="max-w-sm"
        />
        <p className="text-muted-foreground text-body-md">
          &quot;Prisma&quot; is disabled in this list.
        </p>
      </section>

      {/* Checkmark */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Checkmark</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>showCheckmark=false (default)</SubTitle>
          <Select
            id="checkmark-false"
            label="Fruit"
            options={fruitsOptions}
            defaultValue="banana"
            placeholder="Select a fruit…"
            showCheckmark={false}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>showCheckmark=true</SubTitle>
          <Select
            id="checkmark-true"
            label="Fruit"
            options={fruitsOptions}
            defaultValue="banana"
            placeholder="Select a fruit…"
            showCheckmark
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Hint */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Hint</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default icon (Info)</SubTitle>
          <Select
            id="hint-default"
            label="Country"
            options={fruitsOptions}
            placeholder="Select a country…"
            hint="This determines your billing currency and tax region."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Custom icon</SubTitle>
          <Select
            id="hint-custom"
            label="Data retention"
            options={fruitsOptions}
            placeholder="Select a period…"
            hint="Data older than this period will be permanently deleted."
            hintIcon={
              <IconShieldExclamation className="text-warning size-3.5" />
            }
            className="max-w-sm"
          />
        </div>
      </section>
    </div>
  </div>
)
