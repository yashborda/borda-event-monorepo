import { Heading } from '@pkg/ui'

const AboutPage = () => {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Heading as="h1" size="2xl" className="mb-6">
        About Borda Event
      </Heading>
      <p className="text-body-lg text-muted-foreground mb-8">
        Borda Event is a luxury wedding and event decoration & management
        studio based in Surat, Gujarat. We craft elegant, royal, and
        unforgettable celebrations — designed around your story and brought to
        life with cinematic detail.
      </p>

      <Heading className="mb-4">Our mission</Heading>
      <p className="text-muted-foreground mb-8">
        We believe every celebration deserves to feel personal and timeless.
        Our mission is to blend tradition and modern design so each event we
        touch becomes an unforgettable experience for you and your guests.
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
