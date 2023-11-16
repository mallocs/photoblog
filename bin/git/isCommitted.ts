import { execSync } from 'child_process'

export function isCommitted(repoPath, filename) {
  const output = execSync(`git ls-files `, { cwd: repoPath, encoding: 'utf8' })
  return output.includes(filename)
}

export default isCommitted
