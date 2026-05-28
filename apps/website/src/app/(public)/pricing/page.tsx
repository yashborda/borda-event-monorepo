import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
} from '@pkg/ui'

import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for side projects and experiments.',
    features: [
      '1 project',
      'Community support',
      'Core components',
      '1 GB storage',
    ],
    cta: 'Get started',
    href: '/register',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For teams shipping real products.',
    features: [
      'Unlimited projects',
      'Priority support',
      'All components',
      '100 GB storage',
      'Analytics',
    ],
    cta: 'Start free trial',
    href: '/register',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large teams with custom needs.',
    features: [
      'Unlimited everything',
      'Dedicated support',
      'Custom integrations',
      'SSO',
      'SLA',
    ],
    cta: 'Contact us',
    href: '/contact',
    featured: false,
  },
]

const PricingPage = () => {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <Heading as="h1" size="2xl" className="mb-4">
            Simple, transparent pricing
          </Heading>
          <p className="text-muted-foreground text-body-lg">
            Start for free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.featured ? 'border-primary shadow-shadow shadow-md' : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.name}</CardTitle>
                  {tier.featured && (
                    <Badge variant="secondary">Most popular</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-foreground text-3xl font-bold">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-muted-foreground text-sm">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.featured ? 'default' : 'outline'}
                  asChild
                  className="w-full"
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

export default PricingPage
