import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from '#/components/shared/icons'
import siteConfig from '#/site.config'

type Link = {
  name: string
  url: string
  // Component?: IconType
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
      className="px-1 py-1 rounded w-9 h-9 align-middle text-zinc-100 hover:bg-zinc-600 hover:text-primary dark:hover:text-zinc-100"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

export default function Navbar() {
  return (
    <nav className="flex justify-between bg-zinc-600 h-11 px-2 sm:px-8">
      <ul className="flex items-center justify-start">
        {siteConfig.navbarLinks.map(({ name, url }: Link) => (
          <li key={name}>
            <a
              href={url}
              className="mr-4 sm:mr-10 px-4 py-2 uppercase rounded font-sans text-xl font-medium text-zinc-50 dark:text-zinc-50 hover:no-underline hover:bg-zinc-600"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
      <ul className="flex items-center justify-end">
        <li>
          <ColorModeButton />
        </li>
      </ul>
    </nav>
  )
}
