import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

/**
 * Prints the SHA-256 digest to paste into VITE_OWNER_PASSWORD_HASH.
 * Prefer the interactive prompt: command-line arguments persist in shell history.
 */
const fromArgument = process.argv[2]
const readline = fromArgument ? null : createInterface({ input, output })

try {
  const password = fromArgument ?? (await readline?.question('Password to hash: '))
  if (!password) {
    console.error('No password provided.')
    process.exitCode = 1
  } else {
    console.log(createHash('sha256').update(password, 'utf8').digest('hex'))
  }
} finally {
  readline?.close()
}
