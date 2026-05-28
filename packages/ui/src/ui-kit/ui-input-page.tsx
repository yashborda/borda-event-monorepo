'use client'

import {
  IconArrowLeft,
  IconHelpCircle,
  IconShieldExclamation,
  IconWorld,
} from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

type ISize = 'sm' | 'default' | 'lg'
type IType = 'text' | 'email' | 'number' | 'password' | 'url' | 'tel' | 'search'

const sizes: ISize[] = ['sm', 'default', 'lg']
const types: IType[] = [
  'text',
  'email',
  'number',
  'password',
  'url',
  'tel',
  'search',
]

const placeholders: Record<IType, string> = {
  text: 'Enter text…',
  email: 'you@example.com',
  number: '0',
  password: 'Enter password…',
  url: 'https://example.com',
  tel: '+1 (555) 000-0000',
  search: 'Search…',
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

export const UiInputPage = () => (
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
          <h1 className="text-heading-2xl text-foreground">Input Testing</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All size × type × state combinations
          </p>
        </div>
      </div>

      {/* Size */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Size</SectionTitle>
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="text-muted-foreground text-body-sm w-16 font-mono">
                {size}
              </span>
              <div className="flex max-w-sm flex-col gap-1.5">
                <Label htmlFor={`size-${size}`} size={size}>
                  Label
                </Label>
                <Input
                  id={`size-${size}`}
                  size={size}
                  placeholder={`${size} input`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Type × Size */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Type × Size</SectionTitle>
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="text-body-md w-full">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="text-muted-foreground text-label-sm px-4 py-2 text-left">
                  Type
                </th>
                {sizes.map((s) => (
                  <th
                    key={s}
                    className="text-muted-foreground text-label-sm px-4 py-2 text-left"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t} className="border-border border-b last:border-0">
                  <td className="text-muted-foreground text-body-sm px-4 py-3 font-mono">
                    {t}
                  </td>
                  {sizes.map((s) => (
                    <td key={s} className="px-4 py-3">
                      <div className="flex min-w-[140px] flex-col gap-1.5">
                        <Label htmlFor={`${t}-${s}`} size={s}>
                          {t}
                        </Label>
                        <Input
                          id={`${t}-${s}`}
                          type={t}
                          size={s}
                          placeholder={placeholders[t]}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Label Prop */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Label Prop</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`label-size-${size}`}
                size={size}
                label="Username"
                placeholder={`${size} input`}
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <Input
            id="label-required"
            label="Email"
            placeholder="you@example.com"
            required
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <Input
            id="label-disabled"
            label="Username"
            placeholder="Disabled input"
            disabled
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Invalid</SubTitle>
          <Input
            id="label-invalid"
            label="Email"
            defaultValue="bad-value"
            aria-invalid="true"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Error message</SubTitle>
          <Input
            id="label-error"
            label="Email"
            defaultValue="not-an-email"
            errorMessage="Please enter a valid email address."
            className="max-w-sm"
          />
          <Input
            id="label-error-password"
            type="password"
            label="Password"
            defaultValue="123"
            errorMessage="Password must be at least 8 characters."
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Password</SubTitle>
          <Input
            id="label-password"
            type="password"
            label="Password"
            placeholder="Enter password…"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Hint</SubTitle>
          <Input
            id="label-hint"
            label="Email"
            placeholder="you@example.com"
            hint="We'll send account notifications to this address."
            className="max-w-sm"
          />
          <Input
            id="label-hint-icon"
            label="API Key"
            placeholder="sk-…"
            hint="Keep this secret. Never share your API key publicly."
            hintIcon={
              <IconShieldExclamation className="text-warning size-3.5" />
            }
            className="max-w-sm"
          />
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-6">
        <SectionTitle>States</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>Default</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-default">Username</Label>
            <Input id="input-default" placeholder="Placeholder text" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With value</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-value">Email</Label>
            <Input id="input-value" defaultValue="john.doe@example.com" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-disabled">Username</Label>
            <Input id="input-disabled" placeholder="Disabled input" disabled />
          </div>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-disabled-value">Email</Label>
            <Input
              id="input-disabled-value"
              defaultValue="Disabled with value"
              disabled
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Required</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-required" required>
              Username
            </Label>
            <Input
              id="input-required"
              placeholder="Placeholder text"
              required
            />
          </div>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-required-value" required>
              Email
            </Label>
            <Input
              id="input-required-value"
              defaultValue="john.doe@example.com"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Invalid</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-invalid">Email</Label>
            <Input
              id="input-invalid"
              placeholder="Invalid input"
              aria-invalid="true"
            />
          </div>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="input-invalid-value">Email</Label>
            <Input
              id="input-invalid-value"
              defaultValue="bad-value"
              aria-invalid="true"
            />
          </div>
        </div>
      </section>

      {/* Icon */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Icon</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>iconPosition=&quot;right&quot; (default)</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`icon-right-${size}`}
                size={size}
                label="Account number"
                placeholder="000-00-0000"
                icon={<IconHelpCircle className="size-full" />}
                iconPosition="right"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>iconPosition=&quot;left&quot;</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`icon-left-${size}`}
                size={size}
                label="Search"
                placeholder="Search…"
                icon={<IconWorld className="size-full" />}
                iconPosition="left"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With error</SubTitle>
          <Input
            id="icon-error"
            label="Account number"
            placeholder="000-00-0000"
            icon={<IconHelpCircle className="size-full" />}
            iconPosition="right"
            errorMessage="Invalid account number."
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Add-on */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Add-on</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>addonPosition=&quot;left&quot; (default)</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`addon-left-${size}`}
                size={size}
                label="Company website"
                placeholder="www.example.com"
                addon="https://"
                addonPosition="left"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>addonPosition=&quot;right&quot;</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`addon-right-${size}`}
                size={size}
                label="Email"
                placeholder="username"
                addon="@example.com"
                addonPosition="right"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Icon add-on</SubTitle>
          <Input
            id="addon-icon"
            label="Website"
            placeholder="www.example.com"
            addon={<IconWorld className="size-4" />}
            addonPosition="left"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>addon left + icon right / addon right + icon left</SubTitle>
          <Input
            id="addon-left-icon-right"
            label="Company website"
            placeholder="www.example.com"
            addon="https://"
            addonPosition="left"
            icon={<IconHelpCircle className="size-full" />}
            iconPosition="right"
            className="max-w-sm"
          />
          <Input
            id="addon-right-icon-left"
            label="Email"
            placeholder="username"
            addon="@example.com"
            addonPosition="right"
            icon={<IconWorld className="size-full" />}
            iconPosition="left"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With error</SubTitle>
          <Input
            id="addon-error"
            label="Company website"
            placeholder="www.example.com"
            addon="https://"
            errorMessage="Please enter a valid URL."
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Inline Select */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Inline Select</SectionTitle>

        <div className="flex flex-col gap-4">
          <SubTitle>selectPosition=&quot;left&quot; (default)</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`select-left-${size}`}
                size={size}
                label="Phone number"
                placeholder="000-000-0000"
                selectOptions={[
                  { label: '+1', value: 'us' },
                  { label: '+44', value: 'uk' },
                  { label: '+91', value: 'in' },
                  { label: '+61', value: 'au' },
                ]}
                selectDefaultValue="us"
                selectPosition="left"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>selectPosition=&quot;right&quot;</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <Input
                key={size}
                id={`select-right-${size}`}
                size={size}
                label="Amount"
                placeholder="0.00"
                selectOptions={[
                  { label: 'USD', value: 'usd' },
                  { label: 'EUR', value: 'eur' },
                  { label: 'GBP', value: 'gbp' },
                  { label: 'INR', value: 'inr' },
                ]}
                selectDefaultValue="usd"
                selectPosition="right"
                className="max-w-sm"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With icon + select</SubTitle>
          <Input
            id="select-with-icon"
            label="Phone number"
            placeholder="000-000-0000"
            selectOptions={[
              { label: '+1', value: 'us' },
              { label: '+44', value: 'uk' },
              { label: '+91', value: 'in' },
            ]}
            selectDefaultValue="us"
            selectPosition="left"
            icon={<IconHelpCircle className="size-full" />}
            iconPosition="right"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With error</SubTitle>
          <Input
            id="select-error"
            label="Phone number"
            placeholder="000-000-0000"
            selectOptions={[
              { label: '+1', value: 'us' },
              { label: '+44', value: 'uk' },
            ]}
            selectDefaultValue="us"
            selectPosition="left"
            errorMessage="Please enter a valid phone number."
            className="max-w-sm"
          />
        </div>
      </section>

      {/* Password */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Password Toggle</SectionTitle>
        <div className="flex flex-col gap-4">
          <SubTitle>Sizes</SubTitle>
          <div className="flex flex-col gap-3">
            {sizes.map((size) => (
              <div key={size} className="flex max-w-sm flex-col gap-1.5">
                <Label htmlFor={`password-size-${size}`} size={size}>
                  Password
                </Label>
                <Input
                  id={`password-size-${size}`}
                  type="password"
                  size={size}
                  placeholder="Enter password…"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>With value</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="password-value">Password</Label>
            <Input
              id="password-value"
              type="password"
              defaultValue="supersecret123"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SubTitle>Disabled</SubTitle>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="password-disabled">Password</Label>
            <Input
              id="password-disabled"
              type="password"
              placeholder="Disabled password"
              disabled
            />
          </div>
        </div>
      </section>
    </div>
  </div>
)
