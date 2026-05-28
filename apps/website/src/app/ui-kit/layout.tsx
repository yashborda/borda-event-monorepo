'use client'

import { ThemeToggle } from '@pkg/ui'

const UiKitLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <div className="fixed right-4 bottom-4 z-50">
      <ThemeToggle />
    </div>
  </>
)

export default UiKitLayout
