import { SUMMARY, NAME } from '../lib/constants'

const Intro = () => {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mx-5 mt-4 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {NAME}
      </h1>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        {SUMMARY}
      </h4>
    </section>
  )
}

export default Intro
