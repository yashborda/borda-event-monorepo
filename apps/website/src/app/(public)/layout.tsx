import { Footer } from './_components/footer'
import { Navbar } from './_components/navbar'
import { SocialWidget } from './_components/social-widget'

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
      <SocialWidget />
    </>
  )
}

export default PublicLayout
