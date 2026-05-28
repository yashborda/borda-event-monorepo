import { type ExternalToast, toast as sonner } from 'sonner'

type IActionToastOptions = Omit<ExternalToast, 'action' | 'cancel'> & {
  action: {
    label: string
    onClick: () => void
  }
  cancelLabel?: string
}

const defaultClassNames: ExternalToast['classNames'] = {
  icon: '!text-foreground',
  title: '!text-foreground',
  description: '!text-muted-foreground',
  actionButton: '!bg-primary !text-primary-foreground',
  cancelButton: '!bg-muted !text-muted-foreground',
}

const successClassNames: ExternalToast['classNames'] = {
  icon: '!text-success-foreground',
  title: '!text-success-foreground',
  description: '!text-success-foreground',
  actionButton: '!bg-success-foreground !text-success',
  cancelButton: '!bg-success/20 !text-success-foreground',
}

const errorClassNames: ExternalToast['classNames'] = {
  icon: '!text-destructive-foreground',
  title: '!text-destructive-foreground',
  description: '!text-destructive-foreground',
  actionButton: '!bg-destructive-foreground !text-destructive',
  cancelButton: '!bg-destructive/20 !text-destructive-foreground',
}

const warningClassNames: ExternalToast['classNames'] = {
  icon: '!text-warning-foreground',
  title: '!text-warning-foreground',
  description: '!text-warning-foreground',
  actionButton: '!bg-warning-foreground !text-warning',
  cancelButton: '!bg-warning/20 !text-warning-foreground',
}

const infoClassNames: ExternalToast['classNames'] = {
  icon: '!text-info-foreground',
  title: '!text-info-foreground',
  description: '!text-info-foreground',
  actionButton: '!bg-info-foreground !text-info',
  cancelButton: '!bg-info/20 !text-info-foreground',
}

export const toast = {
  default: (message: string, options?: ExternalToast) =>
    sonner(message, { classNames: defaultClassNames, ...options }),

  success: (message: string, options?: ExternalToast) =>
    sonner.success(message, { classNames: successClassNames, ...options }),

  error: (message: string, options?: ExternalToast) =>
    sonner.error(message, { classNames: errorClassNames, ...options }),

  warning: (message: string, options?: ExternalToast) =>
    sonner.warning(message, { classNames: warningClassNames, ...options }),

  info: (message: string, options?: ExternalToast) =>
    sonner.info(message, { classNames: infoClassNames, ...options }),

  action: (message: string, options: IActionToastOptions) => {
    const { action, cancelLabel = 'Close', ...rest } = options
    return sonner(message, {
      classNames: defaultClassNames,
      ...rest,
      action: {
        label: action.label,
        onClick: action.onClick,
      },
      cancel: {
        label: cancelLabel,
        onClick: () => {},
      },
    })
  },

  promise: sonner.promise,
  dismiss: sonner.dismiss,
}
