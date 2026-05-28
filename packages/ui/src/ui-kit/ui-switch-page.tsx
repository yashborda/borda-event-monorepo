'use client'

import {
  IconArrowLeft,
  IconCheck,
  IconShieldExclamation,
  IconX,
} from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'

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

export const UiSwitchPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Switch</h1>
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
            <div key={size} className="flex items-center gap-4">
              <span className="text-muted-foreground text-body-sm w-16 font-mono">
                {size}
              </span>
              <Switch
                id={`switch-size-${size}`}
                size={size}
                label={`${size} switch`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-6">
        <SectionTitle>States</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Off</SubTitle>
          <Switch id="switch-off" label="Notifications" />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>On</SubTitle>
          <Switch id="switch-on" label="Notifications" defaultChecked />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <Switch
            id="switch-error"
            label="I agree to receive notifications"
            errorMessage="You must enable notifications to proceed."
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <Switch id="switch-disabled-off" label="Notifications" disabled />
          <Switch
            id="switch-disabled-on"
            label="Notifications"
            defaultChecked
            disabled
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Hint</SubTitle>
          <Switch
            id="switch-hint"
            label="Email notifications"
            hint="You'll receive emails for account activity and updates."
          />
          <Switch
            id="switch-hint-icon"
            label="Two-factor authentication"
            hint="Highly recommended. Adds an extra layer of security to your account."
            hintIcon={
              <IconShieldExclamation className="text-warning size-3.5" />
            }
          />
        </div>
      </section>

      {/* Colors */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Colors</SectionTitle>
        <div className="flex flex-col gap-3">
          {(
            [
              'primary',
              'secondary',
              'destructive',
              'success',
              'warning',
              'info',
              'accent',
            ] as const
          ).map((color) => (
            <div key={color} className="flex items-center gap-4">
              <span className="text-muted-foreground text-body-sm w-24 font-mono">
                {color}
              </span>
              <Switch
                id={`switch-color-${color}`}
                color={color}
                defaultChecked
              />
            </div>
          ))}
        </div>
      </section>

      {/* Icons */}
      <section className="flex flex-col gap-6">
        <SectionTitle>With Icons</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>IconCheck / IconX icons</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <div key={size} className="flex items-center gap-4">
                <span className="text-muted-foreground text-body-sm w-16 font-mono">
                  {size}
                </span>
                <Switch
                  id={`switch-icon-off-${size}`}
                  size={size}
                  checkedIcon={<IconCheck className="text-primary size-full" />}
                  uncheckedIcon={
                    <IconX className="text-muted-foreground size-full" />
                  }
                />
                <Switch
                  id={`switch-icon-on-${size}`}
                  size={size}
                  defaultChecked
                  checkedIcon={<IconCheck className="text-primary size-full" />}
                  uncheckedIcon={
                    <IconX className="text-muted-foreground size-full" />
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With label</SubTitle>
          <Switch
            id="switch-icon-label"
            label="Enable notifications"
            checkedIcon={<IconCheck className="text-primary size-full" />}
            uncheckedIcon={
              <IconX className="text-muted-foreground size-full" />
            }
          />
        </div>
      </section>

      {/* Group */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Group</SectionTitle>
        <div className="flex flex-col gap-3">
          <Switch id="pref-email" label="Email notifications" defaultChecked />
          <Switch id="pref-push" label="Push notifications" defaultChecked />
          <Switch id="pref-sms" label="SMS notifications" />
          <Switch id="pref-marketing" label="Marketing emails" disabled />
        </div>
      </section>
    </div>
  </div>
)
