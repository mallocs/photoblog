import { sourceUrl, footerMessage } from '#/site.config'

const Footer = () => {
  return (
    <footer className="border-zinc-400 border-t">
      <div className="py-4 flex flex-col lg:flex-row items-center justify-between px-8">
        <small dangerouslySetInnerHTML={{ __html: footerMessage }} />
        <small className="flex flex-col lg:flex-row justify-center items-center">
          <a href={sourceUrl} className="mx-3">
            View source on GitLab
          </a>
        </small>
      </div>
    </footer>
  )
}

export default Footer
