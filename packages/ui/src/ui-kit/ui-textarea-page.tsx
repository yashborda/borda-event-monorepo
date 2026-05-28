'use client'

import { IconArrowLeft, IconShieldExclamation } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'

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

export const UiTextareaPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Textarea</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size and state combinations
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <div key={size} className="flex items-start gap-4">
              <span className="text-muted-foreground text-body-sm mt-2 w-16 font-mono">
                {size}
              </span>
              <Textarea
                id={`textarea-size-${size}`}
                size={size}
                label="Message"
                placeholder={`${size} textarea`}
                className="max-w-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-6">
        <SectionTitle>States</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default</SubTitle>
          <Textarea
            id="textarea-default"
            label="Message"
            placeholder="Enter your message…"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With value</SubTitle>
          <Textarea
            id="textarea-value"
            label="Message"
            defaultValue="This is some existing content in the textarea."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <Textarea
            id="textarea-required"
            label="Message"
            placeholder="Required field…"
            required
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <Textarea
            id="textarea-error"
            label="Message"
            defaultValue="x"
            errorMessage="Message must be at least 20 characters."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <Textarea
            id="textarea-disabled"
            label="Message"
            placeholder="Disabled textarea"
            disabled
            className="max-w-sm"
          />
          <Textarea
            id="textarea-disabled-value"
            label="Message"
            defaultValue="Disabled with value"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Invalid</SubTitle>
          <Textarea
            id="textarea-invalid"
            label="Message"
            placeholder="Invalid textarea"
            aria-invalid="true"
            className="max-w-sm"
          />
          <Textarea
            id="textarea-invalid-value"
            label="Message"
            defaultValue="bad value"
            aria-invalid="true"
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Hint */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Hint</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default icon (Info)</SubTitle>
          <Textarea
            id="textarea-hint"
            label="Bio"
            placeholder="Tell us about yourself…"
            hint="Markdown is supported. Shown on your public profile."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Custom icon</SubTitle>
          <Textarea
            id="textarea-hint-icon"
            label="Internal notes"
            placeholder="Add a note…"
            hint="Only visible to admins. Never shared with end users."
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
