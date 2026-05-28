'use client'

import { IconArrowLeft, IconShieldExclamation } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { FileUpload } from '../components/ui/file-upload'

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

export const UiFileUploadPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">File Upload</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All state and configuration combinations
          </p>
        </div>
      </div>

      {/* Sizes */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Sizes</SectionTitle>
        <div className="flex flex-col gap-4">
          {(['sm', 'default', 'lg'] as const).map((size) => (
            <div key={size} className="flex items-start gap-4">
              <span className="text-muted-foreground text-body-sm mt-5 w-16 font-mono">
                {size}
              </span>
              <FileUpload
                id={`file-size-${size}`}
                size={size}
                label="Attachment"
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
          <SubTitle>Error message</SubTitle>
          <FileUpload
            id="file-error"
            label="Attachment"
            errorMessage="Please upload a file to continue."
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
      </section>

      {/* Accept */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Accept Filter</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Images only</SubTitle>
          <FileUpload
            id="file-images"
            label="Image"
            accept="image/*"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Documents</SubTitle>
          <FileUpload
            id="file-docs"
            label="Document"
            accept=".pdf,.doc,.docx"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Multiple files</SubTitle>
          <FileUpload
            id="file-multi"
            label="Files"
            multiple
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Multiple images</SubTitle>
          <FileUpload
            id="file-multi-images"
            label="Images"
            accept="image/*"
            multiple
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Max size label */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Max Size Label</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>With maxSizeLabel</SubTitle>
          <FileUpload
            id="file-max-size"
            label="Image"
            accept=".png,.jpg,.gif"
            maxSizeLabel="10MB"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>maxSizeLabel only (no accept)</SubTitle>
          <FileUpload
            id="file-max-size-only"
            label="Attachment"
            maxSizeLabel="5MB"
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Hint */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Hint</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default icon (Info)</SubTitle>
          <FileUpload
            id="hint-default"
            label="Profile photo"
            accept="image/*"
            maxSizeLabel="5MB"
            hint="Recommended size: 400×400 px. Square images look best."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Custom icon</SubTitle>
          <FileUpload
            id="hint-custom"
            label="Sensitive document"
            accept=".pdf"
            hint="This file is encrypted at rest and never shared with third parties."
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
