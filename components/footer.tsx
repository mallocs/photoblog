import { SOURCE_URL, FOOTER_MESSAGE } from '../lib/constants'

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="py-4 flex flex-col lg:flex-row items-center justify-between px-8">
        <div dangerouslySetInnerHTML={{ __html: FOOTER_MESSAGE }} />
        <div className="flex flex-col lg:flex-row justify-center items-center">
          <a href={SOURCE_URL} className="mx-3 font-bold hover:underline">
            View source on GitLab
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
