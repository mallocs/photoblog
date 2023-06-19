import { PropsWithChildren } from 'react'
import Footer from '#/components/Footer'
import Navbar from '#/components/Navbar'
import SiteName from '#/components/SiteName'

export const DefaultLayout = ({ children }: PropsWithChildren<unknown>) => (
  <div className="min-h-screen flex flex-col">
    <div className="grow">
      <SiteName />
      <Navbar />
      <main>{children}</main>
    </div>
    <Footer />
  </div>
)
