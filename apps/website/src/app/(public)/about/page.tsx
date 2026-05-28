import { Heading } from '@pkg/ui'

const AboutPage = () => {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Heading as="h1" size="2xl" className="mb-6">
        About Frostleaf
      </Heading>
      <p className="text-body-lg text-muted-foreground mb-8">
        Frostleaf is a monorepo starter kit built for teams that want to ship
        faster without sacrificing quality. We provide shared UI components,
        consistent tooling, and sensible defaults so you can focus on what
        matters.
      </p>

      <Heading className="mb-4">Our mission</Heading>
      <p className="text-muted-foreground mb-8">
        We believe great developer experience leads to great user experience.
        Our mission is to eliminate repetitive setup work so every new project
        starts on a solid foundation.
      </p>

      <Heading className="mb-6">Team</Heading>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {team.map((member) => (
          <div key={member.name} className="flex flex-col items-center gap-3">
            <div className="bg-muted h-20 w-20 rounded-full" />
            <div className="text-center">
              <p className="text-foreground font-medium">{member.name}</p>
              <p className="text-muted-foreground text-sm">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

const team = [
  { name: 'Alex Johnson', role: 'Co-founder & CEO' },
  { name: 'Sam Rivera', role: 'Co-founder & CTO' },
  { name: 'Jordan Lee', role: 'Head of Design' },
]

export default AboutPage
