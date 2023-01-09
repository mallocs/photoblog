import { useEffect, useState } from 'react'
import { navbarLinks } from '#/site.config'

type Link = {
  name: string
  url: string
  // Component?: IconType
}

const MoonIcon = () => (
  <svg
    role="img"
    pointerEvents="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 24 24"
  >
    <title>Moon</title>
    <path
      fill="currentColor"
      d="M9.5 2c-1.82 0-3.53.5-5 1.35c2.99 1.73 5 4.95 5 8.65s-2.01 6.92-5 8.65c1.47.85 3.18 1.35 5 1.35c5.52 0 10-4.48 10-10S15.02 2 9.5 2z"
    />
  </svg>
)

const SunIcon = () => (
  <svg
    role="img"
    pointerEvents="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 24 24"
  >
    <title>Sun</title>
    <path
      fill="currentColor"
      d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
    />
  </svg>
)

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
    <nav className="flex justify-between bg-zinc-600 h-11 px-2 sm:px-8 mb-8 md:mb-12">
      <ul className="flex items-center justify-start text-zinc-50 ">
        {navbarLinks.map(({ name, url }: Link) => (
          <li key={name}>
            <a
              href={url}
              className="mr-4 sm:mr-10 px-4 py-2 uppercase font-sans text-xl font-medium text-zinc-50 hover:bg-zinc-600 rounded"
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
