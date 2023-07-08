export default function normalizeTag(tag) {
  return tag.replaceAll(' ', '_').toLowerCase()
}
