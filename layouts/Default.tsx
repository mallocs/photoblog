import type { PropsWithChildren } from 'react'
import Footer from '#/components/footer'
import Navbar from '#/components/navbar'
import SiteName from '#/components/site-name'

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
