'use client'

import { IconArrowLeft } from '@tabler/icons-react'

import { useState } from 'react'

import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'
import { Input } from '../components/ui/input'

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

// ─── Demos ────────────────────────────────────────────────────────────────────

const BasicDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Basic Dialog"
        actions={[
          {
            label: 'Cancel',
            variant: 'ghost',
            onClick: () => setOpen(false),
            className: 'ml-auto',
          },
          { label: 'Confirm', onClick: () => setOpen(false) },
        ]}
      >
        <p className="text-body-md text-muted-foreground">
          This is a basic dialog with a title and action buttons. Use it to
          present focused content or ask for simple confirmation.
        </p>
      </Dialog>
    </>
  )
}

const WithDescriptionDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        With Description
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Session Expired"
        description="Your session has timed out due to inactivity."
        actions={[
          {
            label: 'Log in again',
            onClick: () => setOpen(false),
            className: 'ml-auto',
          },
        ]}
      >
        <p className="text-body-md text-muted-foreground">
          Please log back in to continue where you left off. Any unsaved changes
          may have been lost.
        </p>
      </Dialog>
    </>
  )
}

const WithTriggerDemo = () => (
  <Dialog
    title="Built-in Trigger"
    description="Pass a trigger element and the dialog handles open/close itself."
    trigger={<Button variant="outline-secondary">Open via Trigger</Button>}
    actions={[{ label: 'Got it', className: 'ml-auto' }]}
  >
    <p className="text-body-md text-muted-foreground">
      When a{' '}
      <code className="text-body-sm bg-muted rounded px-1 py-0.5">trigger</code>{' '}
      prop is provided, the dialog manages its own open state — no external{' '}
      <code className="text-body-sm bg-muted rounded px-1 py-0.5">
        useState
      </code>{' '}
      required.
    </p>
  </Dialog>
)

const WithFormDemo = () => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(name)
    setOpen(false)
    setName('')
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Rename Item
      </Button>
      {submitted && (
        <span className="text-body-sm text-muted-foreground">
          Renamed to: <strong>{submitted}</strong>
        </span>
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Rename Item"
        description="Enter a new name for this item."
        actions={[
          {
            label: 'Cancel',
            variant: 'ghost',
            onClick: () => setOpen(false),
            className: 'ml-auto',
          },
          { label: 'Save', type: 'submit', form: 'rename-form' },
        ]}
      >
        <form id="rename-form" onSubmit={handleSubmit}>
          <Input
            placeholder="New name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </form>
      </Dialog>
    </div>
  )
}

const DestructiveDemo = () => {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline-destructive"
        onClick={() => {
          setDeleted(false)
          setOpen(true)
        }}
      >
        Delete Record
      </Button>
      {deleted && (
        <span className="text-body-sm text-destructive font-medium">
          Record deleted.
        </span>
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Record"
        description="This action cannot be undone."
        actions={[
          {
            label: 'Cancel',
            variant: 'ghost',
            onClick: () => setOpen(false),
            className: 'ml-auto',
          },
          {
            label: 'Delete',
            variant: 'destructive',
            onClick: () => {
              setDeleted(true)
              setOpen(false)
            },
          },
        ]}
      >
        <p className="text-body-md text-muted-foreground">
          Are you sure you want to delete this record? All associated data will
          be permanently removed from our servers.
        </p>
      </Dialog>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const UiDialogPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Dialog</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            Modal dialogs for confirmations, forms, and focused interactions.
          </p>
        </div>
      </div>

      {/* Basic */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Basic</SectionTitle>
        <SubTitle>Simple confirmation dialog</SubTitle>
        <BasicDemo />
      </section>

      {/* With Description */}
      <section className="flex flex-col gap-4">
        <SectionTitle>With Description</SectionTitle>
        <SubTitle>Optional subtitle below the title</SubTitle>
        <WithDescriptionDemo />
      </section>

      {/* Built-in trigger */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Built-in Trigger</SectionTitle>
        <SubTitle>Pass a trigger prop — no external state needed</SubTitle>
        <WithTriggerDemo />
      </section>

      {/* With Form */}
      <section className="flex flex-col gap-4">
        <SectionTitle>With Form</SectionTitle>
        <SubTitle>Use the form + submit action pattern</SubTitle>
        <WithFormDemo />
      </section>

      {/* Destructive */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Destructive Action</SectionTitle>
        <SubTitle>Delete / danger confirmation pattern</SubTitle>
        <DestructiveDemo />
      </section>
    </div>
  </div>
)
