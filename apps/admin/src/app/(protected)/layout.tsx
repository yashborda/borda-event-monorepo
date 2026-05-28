import type { Metadata } from 'next'

import { AuthGuard } from './_components/auth-guard'
import { Sidebar } from './_components/sidebar'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const ProtectedLayout = ({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-auto">
        <main className="container m-auto max-w-7xl flex-1 p-6">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>

      {modal}
    </div>
  )
}

export default ProtectedLayout
