import { promisify } from 'util'
import { commit } from './commit'

export { addFile, addPath } from './add'
export { getGitRootPath } from './gitRoot'
export { commitAsync }
export { isCommitted } from './isCommitted'

const commitAsync = promisify(commit)
