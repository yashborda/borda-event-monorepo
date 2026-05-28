'use client'

import { IconArrowLeft, IconHelpCircle } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { TagInput } from '../components/ui/tag-input'

type ISize = 'sm' | 'default' | 'lg'

const sizes: ISize[] = ['sm', 'default', 'lg']

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

export const UiTagInputPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">
            Tag Input Testing
          </h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size × state combinations — press Enter to add, comma-separated
            values to bulk-add, Backspace to highlight/remove last tag
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <div key={size} className="flex items-start gap-4">
              <span className="text-muted-foreground text-body-sm mt-2 w-16 font-mono">
                {size}
              </span>
              <TagInput
                id={`size-${size}`}
                size={size}
                placeholder="Type and press Enter…"
                className="max-w-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Label prop */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Label Prop</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <TagInput
                key={size}
                id={`label-size-${size}`}
                size={size}
                label="Tags"
                placeholder="Type and press Enter…"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <TagInput
            id="label-required"
            label="Tags"
            placeholder="Type and press Enter…"
            required
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <TagInput
            id="label-disabled"
            label="Tags"
            placeholder="Disabled"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <TagInput
            id="label-error"
            label="Tags"
            defaultValue={['react', 'typescript']}
            errorMessage="At least 3 tags are required."
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Clearable */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Clearable</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <TagInput
                key={size}
                id={`clearable-${size}`}
                size={size}
                label="Tags"
                defaultValue={['react', 'typescript', 'tailwind']}
                clearable
                className="max-w-sm"
              />
            ))}
          </div>
        </div>
      </section>

      {/* With default values */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Pre-filled Tags</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default value</SubTitle>
          <TagInput
            id="prefilled"
            label="Interests"
            defaultValue={['design', 'engineering', 'product']}
            placeholder="Add more…"
            clearable
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Many tags (wrap behaviour)</SubTitle>
          <TagInput
            id="many-tags"
            label="Skills"
            defaultValue={[
              'react',
              'typescript',
              'tailwind',
              'next.js',
              'prisma',
              'postgres',
              'docker',
            ]}
            placeholder="Add more…"
            clearable
            className="max-w-sm"
          />
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-6">
        <SectionTitle>States</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default (empty)</SubTitle>
          <TagInput
            id="state-default"
            placeholder="Type and press Enter…"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled with tags</SubTitle>
          <TagInput
            id="state-disabled"
            defaultValue={['react', 'typescript']}
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Invalid</SubTitle>
          <TagInput
            id="state-invalid"
            defaultValue={['bad-tag']}
            aria-invalid="true"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error</SubTitle>
          <TagInput
            id="state-error"
            label="Tags"
            defaultValue={['one']}
            errorMessage="Please add at least 3 tags."
            clearable
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Hint */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Hint</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default icon (Info)</SubTitle>
          <TagInput
            id="hint-default"
            label="Keywords"
            placeholder="Type and press Enter…"
            hint="Press Enter or comma to add a tag. Used for search indexing."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Custom icon</SubTitle>
          <TagInput
            id="hint-custom"
            label="Allowed domains"
            placeholder="e.g. example.com"
            hint="Only users from these domains can access this resource."
            hintIcon={<IconHelpCircle className="text-info size-3.5" />}
            className="max-w-sm"
          />
        </div>
      </section>
    </div>
  </div>
)
