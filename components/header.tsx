import Link from 'next/link'
import { NAME } from '../lib/constants'

const Header = () => {
  return (
    <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
      <Link href="/">
        <a className="hover:underline">{NAME}</a>
      </Link>
    </h2>
  )
}

export default Header
