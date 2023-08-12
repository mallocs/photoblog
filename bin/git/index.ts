import { promisify } from 'util'
import { commit } from './commit'

export { addFile, addPath } from './add'
export { getGitRootPath } from './gitRoot'
export { commitAsync }

const commitAsync = promisify(commit)
