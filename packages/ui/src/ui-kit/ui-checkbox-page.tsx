'use client'

import { IconArrowLeft, IconLock } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'

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

export const UiCheckboxPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Checkbox</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size and state combinations
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <Checkbox
              key={size}
              id={`checkbox-size-${size}`}
              size={size}
              label={`${size} checkbox`}
            />
          ))}
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-6">
        <SectionTitle>States</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Unchecked</SubTitle>
          <Checkbox
            id="checkbox-unchecked"
            label="Accept terms and conditions"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Checked</SubTitle>
          <Checkbox
            id="checkbox-checked"
            label="Accept terms and conditions"
            defaultChecked
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Indeterminate</SubTitle>
          <Checkbox
            id="checkbox-indeterminate"
            label="Select all"
            checked="indeterminate"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <Checkbox
            id="checkbox-error"
            label="Accept terms and conditions"
            errorMessage="You must accept the terms to continue."
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <Checkbox
            id="checkbox-disabled"
            label="Accept terms and conditions"
            disabled
          />
          <Checkbox
            id="checkbox-disabled-checked"
            label="Accept terms and conditions"
            defaultChecked
            disabled
          />
          <Checkbox
            id="checkbox-disabled-indeterminate"
            label="Select all"
            checked="indeterminate"
            disabled
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Hint</SubTitle>
          <Checkbox
            id="checkbox-hint"
            label="Accept terms and conditions"
            hint="By accepting, you agree to our terms of service and privacy policy."
          />
          <Checkbox
            id="checkbox-hint-icon"
            label="Marketing emails"
            hint="You can unsubscribe at any time from your account settings."
            hintIcon={<IconLock className="text-muted-foreground size-3.5" />}
          />
        </div>
      </section>

      {/* Group */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Group</SectionTitle>
        <div className="flex flex-col gap-3">
          <Checkbox id="group-a" label="Option A" defaultChecked />
          <Checkbox id="group-b" label="Option B" defaultChecked />
          <Checkbox id="group-c" label="Option C" />
          <Checkbox id="group-d" label="Option D (disabled)" disabled />
        </div>
      </section>
    </div>
  </div>
)
