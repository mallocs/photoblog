import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { SunIcon, MoonIcon } from '#/components/shared/icons'
import { HomeButton } from '#/components/shared/buttons/HomeButton'
import siteConfig from '#/site.config'
import { useObserverGroup } from '#/lib/intersection-observer-group'

type Link = {
  name: string
  iconName?: string
  url: string
}

function ColorModeButton() {
  const [theme, setTheme] = useState(undefined)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }
  useEffect(() => {
    if (theme === undefined) {
      setTheme(localStorage.getItem('theme') || 'light')
    } else {
      window.localStorage.setItem('theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])
  return typeof theme === 'undefined' ? null : (
    <button
      className="px-1 py-1 rounded w-9 h-9 align-middle text-zinc-100 hover:bg-zinc-600 hover:text-primary dark:hover:text-primaryDark"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

export default function Navbar() {
  const {
    ref,
    inView: navbarInView,
    entry,
  } = useObserverGroup({
    threshold: [0, 0.01, 0.99, 1],
  })

  return (
    <>
      <nav ref={ref} className="bg-zinc-600">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-12 items-center justify-between">
            <div className="flex flex-1 justify-start items-center space-x-4">
              {siteConfig.navbarLinks.map(({ name, iconName, url }: Link) => {
                return (
                  <a
                    key={name}
                    href={url}
                    className={`${
                      iconName !== undefined ? 'text-3xl/4' : 'text-2xl'
                    } px-4 py-2 uppercase rounded font-sans font-medium  text-zinc-100 dark:text-zinc-100 hover:no-underline hover:text-primary dark:hover:text-primaryDark`}
                  >
                    {iconName !== undefined ? (
                      <SIIcons name={`Si${iconName}`} title={name} />
                    ) : (
                      name
                    )}
                  </a>
                )
              })}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <ColorModeButton />
            </div>
          </div>
        </div>
      </nav>
      {entry !== undefined && (
        <span className="fixed top-4 left-4 z-10">
          <HomeButton hide={navbarInView} />
        </span>
      )}
    </>
  )
}

const SIIcons = ({ title, name }) => {
  // TODO: react-icons seems to be adding the title but keeps a blank title element as well.
  // It seems to do this even when it isn't dynamically imported.
  const Comp = dynamic(async () => (await import('react-icons/si'))[name])
  // @ts-ignore The imported props don't seem to be recognized
  return <Comp title={title} />
}
