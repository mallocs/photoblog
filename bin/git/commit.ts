// From https://github.com/commitizen/cz-cli/blob/6ef8afa7600da429a473290a917003177a2ec00a/src/commitizen/commit.js
import { spawn } from 'child_process'
import dedent from 'dedent'

export { commit }

/**
 * Asynchronously git commit at a given path with a message
 */
function commit(repoPath, message, options, done) {
  let called = false

  let args = ['commit', '-m', dedent(message), ...(options.args || [])]
  let child = spawn('git', args, {
    cwd: repoPath,
    stdio: options.quiet ? 'ignore' : 'inherit',
  })

  child.on('error', function (err) {
    if (called) return
    called = true

    done(err)
  })

  child.on('exit', function (code, signal) {
    if (called) return
    called = true

    if (code) {
      if (code === 128) {
        console.warn(`
            Git exited with code 128. Did you forget to run:

              git config --global user.email "you@example.com"
              git config --global user.name "Your Name"
            `)
      }
      done(
        Object.assign(new Error(`git exited with error code ${code}`), {
          code,
          signal,
        })
      )
    } else {
      done(null)
    }
  })
}
