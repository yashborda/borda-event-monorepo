'use client'

import { IconArrowLeft } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'
import { FileUpload } from '../components/ui/file-upload'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio'
import { Switch } from '../components/ui/switch'
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

export const UiFormPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Form Elements</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            Textarea, Checkbox, Radio, File Upload and Switch
          </p>
        </div>
      </div>

      {/* Textarea */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Textarea</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Textarea
                key={size}
                id={`textarea-size-${size}`}
                size={size}
                label="Message"
                placeholder={`${size} textarea`}
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

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
          <SubTitle>Disabled</SubTitle>
          <Textarea
            id="textarea-disabled"
            label="Message"
            placeholder="Disabled textarea"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Invalid</SubTitle>
          <Textarea
            id="textarea-invalid"
            label="Message"
            defaultValue="bad value"
            aria-invalid="true"
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Checkbox */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Checkbox</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
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
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>States</SubTitle>
          <div className="flex flex-col gap-3">
            <Checkbox id="checkbox-unchecked" label="Unchecked" />
            <Checkbox id="checkbox-checked" label="Checked" defaultChecked />
            <Checkbox
              id="checkbox-indeterminate"
              label="Indeterminate"
              checked="indeterminate"
            />
            <Checkbox id="checkbox-disabled" label="Disabled" disabled />
            <Checkbox
              id="checkbox-disabled-checked"
              label="Disabled checked"
              defaultChecked
              disabled
            />
          </div>
        </div>
      </section>

      {/* Radio */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Radio</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-6">
            {sizes.map((size) => (
              <RadioGroup key={size} defaultValue="a">
                <RadioGroupItem
                  id={`radio-${size}-a`}
                  value="a"
                  size={size}
                  label={`Option A (${size})`}
                />
                <RadioGroupItem
                  id={`radio-${size}-b`}
                  value="b"
                  size={size}
                  label={`Option B (${size})`}
                />
              </RadioGroup>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>States</SubTitle>
          <RadioGroup defaultValue="enabled">
            <RadioGroupItem
              id="radio-enabled"
              value="enabled"
              label="Enabled"
            />
            <RadioGroupItem
              id="radio-disabled"
              value="disabled"
              label="Disabled"
              disabled
            />
            <RadioGroupItem
              id="radio-disabled-checked"
              value="disabled-checked"
              label="Disabled checked"
              disabled
            />
          </RadioGroup>
        </div>
      </section>

      {/* File Upload */}
      <section className="flex flex-col gap-6">
        <SectionTitle>File Upload</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default</SubTitle>
          <FileUpload id="file-default" className="max-w-sm" />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With Label</SubTitle>
          <FileUpload id="file-label" label="Attachment" className="max-w-sm" />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <FileUpload
            id="file-required"
            label="Attachment"
            required
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <FileUpload
            id="file-disabled"
            label="Attachment"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Accept Filter</SubTitle>
          <FileUpload
            id="file-accept"
            label="Image"
            accept="image/*"
            className="max-w-sm"
          />
          <FileUpload
            id="file-accept-multi"
            label="Documents (multiple)"
            accept=".pdf,.doc,.docx"
            multiple
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Switch */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Switch</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Switch
                key={size}
                id={`switch-size-${size}`}
                size={size}
                label={`${size} switch`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>States</SubTitle>
          <div className="flex flex-col gap-3">
            <Switch id="switch-off" label="Off" />
            <Switch id="switch-on" label="On" defaultChecked />
            <Switch id="switch-disabled-off" label="Disabled off" disabled />
            <Switch
              id="switch-disabled-on"
              label="Disabled on"
              defaultChecked
              disabled
            />
          </div>
        </div>
      </section>
    </div>
  </div>
)
