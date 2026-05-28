'use client'

import { IconArrowRight } from '@tabler/icons-react'

import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../components/card'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'

type IDialogSectionProps = {
  sectionClass: string
}

const DialogSection = ({ sectionClass }: IDialogSectionProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)

  return (
    <section id="dialog" className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className="text-heading-xl text-foreground">Dialog</h2>
        <Button
          variant="ghost"
          size="sm"
          icon={<IconArrowRight />}
          iconPosition="end"
          asChild
        >
          <a href="/ui-kit/dialog">More Dialogs</a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setConfirmOpen(true)}>Open Dialog</Button>
          <Dialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirm Action"
            description="Are you sure you want to proceed?"
            actions={[
              {
                label: 'Cancel',
                variant: 'ghost',
                onClick: () => setConfirmOpen(false),
                className: 'ml-auto',
              },
              { label: 'Confirm', onClick: () => setConfirmOpen(false) },
            ]}
          >
            <p className="text-body-md text-muted-foreground">
              This will apply your changes. You can undo this later from
              settings.
            </p>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destructive</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline-destructive"
            onClick={() => {
              setDeleted(false)
              setDeleteOpen(true)
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
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Record"
            description="This action cannot be undone."
            actions={[
              {
                label: 'Cancel',
                variant: 'ghost',
                onClick: () => setDeleteOpen(false),
                className: 'ml-auto',
              },
              {
                label: 'Delete',
                variant: 'destructive',
                onClick: () => {
                  setDeleted(true)
                  setDeleteOpen(false)
                },
              },
            ]}
          >
            <p className="text-body-md text-muted-foreground">
              Are you sure you want to delete this record? All associated data
              will be permanently removed.
            </p>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Built-in Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog
            title="Built-in Trigger"
            description="No external state needed."
            trigger={<Button variant="outline">Open via Trigger</Button>}
            actions={[{ label: 'Got it', className: 'ml-auto' }]}
          >
            <p className="text-body-md text-muted-foreground">
              Pass a <code className="bg-muted rounded px-1">trigger</code> prop
              and the dialog manages open/close itself.
            </p>
          </Dialog>
        </CardContent>
      </Card>
    </section>
  )
}

export default DialogSection
