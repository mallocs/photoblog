import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  SunIcon,
  MoonIcon,
  HamburgerOpenIcon,
  HamburgerCloseIcon,
} from '#/components/shared/icons'
import { HomeButton } from '#/components/shared/buttons/HomeButton'
import { useObserverGroup } from '#/lib/intersection-observer-group'
import siteConfig from '#/site.config'

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
      let initialTheme = localStorage.getItem('theme')
      if (initialTheme === null) {
        initialTheme = siteConfig.defaultToDarkMode ? 'dark' : 'light'
      }
      setTheme(initialTheme)
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

function navbarLinks({ block, showText } = { block: false, showText: false }) {
  {
    return siteConfig.navbarLinks.map(({ name, iconName, url }: Link) => {
      return (
        <a
          key={name}
          href={url}
          className={`${
            block &&
            'block border-b border-zinc-700 rounded-none last:border-none'
          } text-3xl/4 flex items-center gap-3 px-4 py-2 uppercase rounded font-sans font-medium text-zinc-100 dark:text-zinc-100 hover:no-underline hover:text-primary dark:hover:text-primaryDark`}
        >
          {iconName !== undefined && (
            <SIIcons name={`Si${iconName}`} title={name} />
          )}
          {(showText || iconName === undefined) && (
            <span className="text-2xl">{name}</span>
          )}
        </a>
      )
    })
  }
}

export default function Navbar() {
  const [open, setOpenFn] = useState(false)
  const {
    ref,
    inView: navbarInView,
    entry,
  } = useObserverGroup({
    threshold: [0, 0.01, 0.99, 1],
  })

  return (
    <>
      <nav ref={ref} className="bg-zinc-600 mb-16">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-12 items-center justify-between">
            <div className="absolute inset-y-0 left-0 ml-2 sm:ml-0 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <button
                type="button"
                className="items-center justify-center w-9 h-9 p-1 rounded-md text-zinc-100 hover:bg-zinc-600 hover:text-primary dark:hover:text-primaryDark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary border-zinc-800 border"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setOpenFn(!open)}
              >
                <span className="sr-only">Open main menu</span>
                {open ? <HamburgerOpenIcon /> : <HamburgerCloseIcon />}
              </button>
            </div>
            {/* Full-sized menu */}
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="hidden sm:block">
                <div className="flex space-x-4">{navbarLinks()}</div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <ColorModeButton />
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="space-y-1 px-2 pb-2 pt-2 border-t border-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {navbarLinks({ block: true, showText: true })}
            </div>
          </div>
        )}
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
