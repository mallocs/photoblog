const siteConfig = {
  description: 'A photoblog of adventures and occasional randomness',
  siteProtocol: 'https',
  siteHostname: 'photoblog.mallocs.net',
  get siteUrl() {
    return `${this.siteProtocol}://${this.siteHostname}`
  },
  openGraph: {
    imageHeight: 630,
    imageWidth: 1200,
  },
}

module.exports = siteConfig
