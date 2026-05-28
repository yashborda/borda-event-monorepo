import { Footer } from './_components/footer'
import { Navbar } from './_components/navbar'

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  )
}

export default PublicLayout
