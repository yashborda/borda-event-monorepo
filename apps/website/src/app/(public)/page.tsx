import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
} from '@pkg/ui'

import { cookies } from 'next/headers'
import Link from 'next/link'

const Home = async () => {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('session_exists')?.value === 'true'

  return (
    <main>
      {/* Hero */}
      <section className="bg-background flex flex-col items-center px-6 py-24 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <Badge variant="secondary">Surat • Gujarat</Badge>
          <Heading as="h1" size="2xl">
            Planning for an event
          </Heading>
          <p className="text-body-lg text-muted-foreground max-w-md">
            Borda Event crafts luxury wedding and event decoration in Surat,
            Gujarat — elegant, royal, and unforgettable celebrations designed
            around you.
          </p>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/register">Get started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <Heading className="mb-10 text-center">Everything you need</Heading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>UI Components</CardTitle>
                <CardDescription>
                  Shared shadcn/ui components across all apps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">@pkg/ui</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Type Safe</CardTitle>
                <CardDescription>
                  Strict TypeScript config shared across the monorepo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">TypeScript</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Consistent Style</CardTitle>
                <CardDescription>
                  Shared ESLint and Prettier config for all packages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">ESLint + Prettier</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-muted-foreground text-body-lg italic">
            &ldquo;Borda Event turned our wedding into a dream. Every detail
            was elegant, and every moment unforgettable.&rdquo;
          </p>
          <p className="text-foreground mt-3 font-medium">
            — A happy couple
          </p>
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="bg-primary/5 px-6 py-16 text-center">
          <div className="mx-auto max-w-xl">
            <Heading className="mb-4">Ready to get started?</Heading>
            <p className="text-muted-foreground mb-6">
              Sign up for free and ship your next project faster.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Create free account</Link>
            </Button>
          </div>
        </section>
      )}
    </main>
  )
}

export default Home
