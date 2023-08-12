import childProcess from 'child_process'

export { getGitRootPath }

function getGitRootPath() {
  return childProcess
    .spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    .stdout.trim()
}
