import { IconInfoCircle } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Label as LabelPrimitive } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

const labelVariants = cva(
  'flex items-center gap-1.5 leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'text-body-sm',
        default: 'text-body-md',
        lg: 'text-body-lg',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

type ILabelProps = React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    required?: boolean
    hint?: string
    hintIcon?: React.ReactNode
  }

const Label = ({
  className,
  size,
  required,
  hint,
  hintIcon,
  children,
  ...props
}: ILabelProps) => {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ size }), className)}
      {...props}
    >
      <span className="inline-flex items-center gap-0.75">
        {children}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </span>
      {hint && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                {hintIcon ?? (
                  <IconInfoCircle className="text-muted-foreground size-3.5" />
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </LabelPrimitive.Root>
  )
}

export { Label, labelVariants, type ILabelProps }
