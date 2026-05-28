import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const cookieStore = await cookies()
  const sessionExists = cookieStore.get('session_exists')?.value === 'true'

  if (sessionExists) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
