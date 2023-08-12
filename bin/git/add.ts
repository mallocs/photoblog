// From https://github.com/commitizen/cz-cli/blob/6ef8afa7600da429a473290a917003177a2ec00a/src/git/add.js

import childProcess from 'child_process'

export { addPath, addFile }

/**
 * Synchronously adds a path to git staging
 */
function addPath(repoPath) {
  childProcess.spawnSync('git', ['add', '.'], { cwd: repoPath })
}

/**
 * Synchronously adds a file to git staging
 */
function addFile(repoPath, filename) {
  childProcess.spawnSync('git', ['add', filename], { cwd: repoPath })
}
