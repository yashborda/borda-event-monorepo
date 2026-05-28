'use client'

import { IconArrowLeft, IconHelpCircle } from '@tabler/icons-react'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { Button } from '../components/ui/button'
import { RichContent } from '../components/ui/rich-content'
import { TextEditor } from '../components/ui/text-editor'

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

const KITCHEN_SINK_INITIAL = [
  '<h1>Heading 1</h1>',
  '<h2>Heading 2</h2>',
  '<h3>Heading 3</h3>',
  '<p>Regular paragraph with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s> and <code>inline code</code>.</p>',
  '<p style="text-align: center">Center-aligned paragraph</p>',
  '<p style="text-align: right">Right-aligned paragraph</p>',
  '<ul><li><p>Bullet item one</p></li><li><p>Bullet item two</p></li></ul>',
  '<ol><li><p>Ordered item one</p></li><li><p>Ordered item two</p></li></ol>',
  '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Completed task</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Pending task</p></div></li></ul>',
  '<blockquote><p>A blockquote with cited text.</p></blockquote>',
  '<p>A paragraph with a <a href="https://tiptap.dev" target="_blank">hyperlink</a> and <mark style="background-color: #fef08a">highlighted text</mark>.</p>',
  '<table><tbody><tr><th><p>Header 1</p></th><th><p>Header 2</p></th><th><p>Header 3</p></th></tr><tr><td><p>Cell A</p></td><td><p>Cell B</p></td><td><p>Cell C</p></td></tr><tr><td><p>Cell D</p></td><td><p>Cell E</p></td><td><p>Cell F</p></td></tr></tbody></table>',
  '<hr>',
  '<p></p>',
].join('')

const MIN_CHARS = 20

export const UiTextEditorPage = () => {
  const [controlled, setControlled] = useState('<p>Controlled content</p>')
  const [kitchenHtml, setKitchenHtml] = useState(KITCHEN_SINK_INITIAL)

  return (
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
            <h1 className="text-heading-2xl text-foreground">Text Editor</h1>
            <p className="text-body-md text-muted-foreground mt-1">
              All size and state combinations
            </p>
          </div>
        </div>

        {/* Kitchen sink */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Kitchen sink — every option</SectionTitle>
          <p className="text-body-sm text-muted-foreground -mt-2">
            All toolbar groups · bubble menu · floating insert menu · word count
            · character limit · controlled · live error
          </p>
          <TextEditor
            id="text-editor-kitchen-sink"
            label="Article body"
            required
            placeholder="Write something rich…"
            value={kitchenHtml}
            onChange={setKitchenHtml}
            maxLength={5000}
            showWordCount
            errorMessage={
              kitchenHtml.replace(/<[^>]*>/g, '').trim().length < MIN_CHARS
                ? `Content must be at least ${MIN_CHARS} characters.`
                : undefined
            }
            toolbar={{
              history: true,
              formatting: true,
              headings: true,
              lists: true,
              alignment: true,
              link: true,
              highlight: true,
              image: true,
              table: true,
              extras: true,
              export: true,
            }}
            classNames={{
              toolbar: 'bg-muted/40',
              editor: 'min-h-[260px]',
            }}
          />
          <pre className="bg-muted text-muted-foreground text-body-sm overflow-x-auto rounded-md p-3 leading-relaxed break-all whitespace-pre-wrap">
            {kitchenHtml}
          </pre>
        </section>

        {/* Sizes */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Sizes</SectionTitle>
          <div className="flex flex-col gap-6">
            {sizes.map((size) => (
              <div key={size} className="flex items-start gap-4">
                <span className="text-muted-foreground text-body-sm mt-2 w-16 font-mono">
                  {size}
                </span>
                <TextEditor
                  id={`text-editor-size-${size}`}
                  size={size}
                  label="Message"
                  placeholder={`${size} text editor`}
                  className="flex-1"
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
            <TextEditor
              id="text-editor-default"
              label="Message"
              placeholder="Enter your message…"
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>With default value</SubTitle>
            <TextEditor
              id="text-editor-value"
              label="Message"
              defaultValue="<p>This is some <strong>existing</strong> content in the editor.</p>"
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Required</SubTitle>
            <TextEditor
              id="text-editor-required"
              label="Message"
              placeholder="Required field…"
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Character limit + word count</SubTitle>
            <TextEditor
              id="text-editor-charlimit"
              label="Short bio"
              placeholder="Tell us about yourself…"
              maxLength={200}
              showWordCount
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Error message</SubTitle>
            <TextEditor
              id="text-editor-error"
              label="Message"
              defaultValue="<p>x</p>"
              errorMessage="Message must be at least 20 characters."
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Disabled</SubTitle>
            <TextEditor
              id="text-editor-disabled"
              label="Message"
              placeholder="Disabled editor"
              disabled
            />
            <TextEditor
              id="text-editor-disabled-value"
              label="Message"
              defaultValue="<p>Disabled <strong>with</strong> value</p>"
              disabled
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Controlled</SubTitle>
            <TextEditor
              id="text-editor-controlled"
              label="Controlled editor"
              value={controlled}
              onChange={setControlled}
            />
            <pre className="bg-muted text-muted-foreground text-body-sm overflow-x-auto rounded-md p-3 break-all whitespace-pre-wrap">
              {controlled}
            </pre>
          </div>
        </section>

        {/* Rich content */}
        <section className="flex flex-col gap-6">
          <SectionTitle>Rich content</SectionTitle>

          <div className="flex flex-col gap-4">
            <SubTitle>Tables</SubTitle>
            <p className="text-body-sm text-muted-foreground">
              Click the table icon to insert. Click inside a table to reveal the
              row/column management toolbar.
            </p>
            <TextEditor
              id="text-editor-table"
              label="With table"
              defaultValue="<table><tbody><tr><th><p>Name</p></th><th><p>Role</p></th><th><p>Status</p></th></tr><tr><td><p>Alice</p></td><td><p>Engineer</p></td><td><p>Active</p></td></tr><tr><td><p>Bob</p></td><td><p>Designer</p></td><td><p>Active</p></td></tr></tbody></table><p></p>"
              toolbar={{
                history: true,
                formatting: false,
                headings: false,
                lists: false,
                alignment: false,
                link: false,
                highlight: false,
                image: false,
                table: true,
                extras: false,
                export: false,
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Images</SubTitle>
            <p className="text-body-sm text-muted-foreground">
              Click the image icon (or use the floating menu on an empty line)
              and paste a URL.
            </p>
            <TextEditor
              id="text-editor-image"
              label="With image"
              placeholder="Insert an image via the toolbar or floating menu…"
              toolbar={{
                history: true,
                formatting: true,
                headings: false,
                lists: false,
                alignment: false,
                link: false,
                highlight: false,
                image: true,
                table: false,
                extras: false,
                export: false,
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Task list</SubTitle>
            <p className="text-body-sm text-muted-foreground">
              Select Task list from the Lists dropdown. Completed items get
              strikethrough styling.
            </p>
            <TextEditor
              id="text-editor-tasklist"
              label="Todo"
              defaultValue='<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /></label><div><p>Buy groceries</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Write documentation</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" /></label><div><p>Deploy to production</p></div></li></ul>'
              toolbar={{
                history: true,
                formatting: true,
                headings: false,
                lists: true,
                alignment: false,
                link: false,
                highlight: false,
                image: false,
                table: false,
                extras: false,
                export: false,
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Highlight</SubTitle>
            <p className="text-body-sm text-muted-foreground">
              Select text and use the highlighter dropdown or bubble menu
              swatches.
            </p>
            <TextEditor
              id="text-editor-highlight"
              label="Highlighted text"
              defaultValue='<p>Select any text and use the <mark style="background-color: #fef08a">highlight dropdown</mark> or the <mark style="background-color: #bfdbfe">bubble menu swatches</mark> that appear on selection.</p>'
              toolbar={{
                history: true,
                formatting: true,
                headings: false,
                lists: false,
                alignment: false,
                link: false,
                highlight: true,
                image: false,
                table: false,
                extras: false,
                export: false,
              }}
            />
          </div>
        </section>

        {/* Export */}
        <section className="flex flex-col gap-6">
          <SectionTitle>Content export</SectionTitle>
          <p className="text-body-sm text-muted-foreground -mt-2">
            Use the three export buttons at the right of the toolbar to copy the
            content as HTML, plain text, or Markdown.
          </p>
          <TextEditor
            id="text-editor-export"
            label="Export demo"
            defaultValue="<h2>Try the export buttons</h2><p>This editor has <strong>bold</strong>, <em>italic</em>, and a <a href='https://tiptap.dev'>link</a>.</p><ul><li><p>Bullet one</p></li><li><p>Bullet two</p></li></ul>"
            toolbar={{
              history: false,
              formatting: true,
              headings: true,
              lists: true,
              alignment: false,
              link: true,
              highlight: false,
              image: false,
              table: false,
              extras: false,
              export: true,
            }}
          />
        </section>

        {/* RichContent */}
        <section className="flex flex-col gap-6">
          <SectionTitle>RichContent — read-only display</SectionTitle>
          <p className="text-body-sm text-muted-foreground -mt-2">
            Use <code className="text-body-sm">RichContent</code> to render
            editor HTML outside the editor. Styled with{' '}
            <code className="text-body-sm">@tailwindcss/typography</code> and
            the app theme.
          </p>

          <div className="flex flex-col gap-4">
            <SubTitle>Live preview — mirrors kitchen sink editor</SubTitle>
            <div className="border-border rounded-md border p-6">
              <RichContent html={kitchenHtml} />
            </div>
          </div>
        </section>

        {/* Toolbar customisation */}
        <section className="flex flex-col gap-6">
          <SectionTitle>Toolbar customisation</SectionTitle>

          <div className="flex flex-col gap-4">
            <SubTitle>Formatting only</SubTitle>
            <TextEditor
              id="text-editor-formatting-only"
              label="Notes"
              placeholder="Bold, italic, underline…"
              toolbar={{
                history: false,
                formatting: true,
                headings: false,
                lists: false,
                alignment: false,
                link: false,
                highlight: false,
                image: false,
                table: false,
                extras: false,
                export: false,
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>History + formatting</SubTitle>
            <TextEditor
              id="text-editor-minimal"
              label="Minimal"
              placeholder="History and formatting only…"
              toolbar={{
                history: true,
                formatting: true,
                headings: false,
                lists: false,
                alignment: false,
                link: false,
                highlight: false,
                image: false,
                table: false,
                extras: false,
                export: false,
              }}
            />
          </div>
        </section>

        {/* Hint */}
        <section className="flex flex-col gap-6">
          <SectionTitle>Hint</SectionTitle>

          <div className="flex flex-col gap-4">
            <SubTitle>Default icon (Info)</SubTitle>
            <TextEditor
              id="hint-default"
              label="Article body"
              placeholder="Write your article…"
              hint="Supports rich text formatting including bold, italic, and links."
            />
          </div>

          <div className="flex flex-col gap-4">
            <SubTitle>Custom icon</SubTitle>
            <TextEditor
              id="hint-custom"
              label="Legal disclaimer"
              placeholder="Enter disclaimer text…"
              hint="This content is shown verbatim to end users. Review carefully before saving."
              hintIcon={<IconHelpCircle className="text-info size-3.5" />}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
