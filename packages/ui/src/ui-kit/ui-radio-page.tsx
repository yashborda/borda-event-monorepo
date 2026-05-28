'use client'

import { IconArrowLeft, IconHelpCircle } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio'

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

export const UiRadioPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Radio</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size and state combinations
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-8">
          {sizes.map((size) => (
            <div key={size} className="flex items-start gap-4">
              <span className="text-muted-foreground text-body-sm mt-0.5 w-16 font-mono">
                {size}
              </span>
              <RadioGroup defaultValue="a">
                <RadioGroupItem
                  id={`radio-${size}-a`}
                  value="a"
                  size={size}
                  label="Option A"
                />
                <RadioGroupItem
                  id={`radio-${size}-b`}
                  value="b"
                  size={size}
                  label="Option B"
                />
                <RadioGroupItem
                  id={`radio-${size}-c`}
                  value="c"
                  size={size}
                  label="Option C"
                />
              </RadioGroup>
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-6">
        <SectionTitle>States</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default</SubTitle>
          <RadioGroup>
            <RadioGroupItem id="state-none-a" value="a" label="Option A" />
            <RadioGroupItem id="state-none-b" value="b" label="Option B" />
            <RadioGroupItem id="state-none-c" value="c" label="Option C" />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With default value</SubTitle>
          <RadioGroup defaultValue="b">
            <RadioGroupItem id="state-val-a" value="a" label="Option A" />
            <RadioGroupItem id="state-val-b" value="b" label="Option B" />
            <RadioGroupItem id="state-val-c" value="c" label="Option C" />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With disabled items</SubTitle>
          <RadioGroup defaultValue="a">
            <RadioGroupItem id="state-dis-a" value="a" label="Option A" />
            <RadioGroupItem
              id="state-dis-b"
              value="b"
              label="Option B (disabled)"
              disabled
            />
            <RadioGroupItem id="state-dis-c" value="c" label="Option C" />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <RadioGroup errorMessage="Please select an option to continue.">
            <RadioGroupItem id="state-err-a" value="a" label="Option A" />
            <RadioGroupItem id="state-err-b" value="b" label="Option B" />
            <RadioGroupItem id="state-err-c" value="c" label="Option C" />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>All disabled</SubTitle>
          <RadioGroup defaultValue="a" disabled>
            <RadioGroupItem id="state-all-a" value="a" label="Option A" />
            <RadioGroupItem id="state-all-b" value="b" label="Option B" />
            <RadioGroupItem id="state-all-c" value="c" label="Option C" />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Hint</SubTitle>
          <RadioGroup defaultValue="monthly">
            <RadioGroupItem
              id="hint-monthly"
              value="monthly"
              label="Monthly"
              hint="Billed every month. Cancel anytime."
            />
            <RadioGroupItem
              id="hint-annual"
              value="annual"
              label="Annual"
              hint="Save 20% compared to monthly billing."
              hintIcon={<IconHelpCircle className="text-info size-3.5" />}
            />
          </RadioGroup>
        </div>
      </section>

      {/* Orientation */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Orientation</SectionTitle>
        <RadioGroup defaultValue="a" className="flex-row gap-6">
          <RadioGroupItem id="orient-a" value="a" label="Option A" />
          <RadioGroupItem id="orient-b" value="b" label="Option B" />
          <RadioGroupItem id="orient-c" value="c" label="Option C" />
        </RadioGroup>
      </section>
    </div>
  </div>
)
