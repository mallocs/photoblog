import { NAVBAR_LINKS } from '../lib/constants'

type Link = {
  name: string
  url: URL
  // Component?: IconType
}

export default function Navbar() {
  return (
    <nav className="bg-zinc-300 px-5 mb-8 md:mb-12">
      <ul className="flex items-center justify-start h-10">
        {NAVBAR_LINKS.map(({ name, url }: Link) => (
          <li key={name}>
            <a
              href={String(url)}
              className="mr-4 px-4 uppercase font-sans font-medium hover:text-white"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
