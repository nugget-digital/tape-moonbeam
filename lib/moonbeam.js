const child = require('child_process')
const NewlineDecoder = require('newline-decoder')
const EventEmitter = require('events')
const connect = require('./connect')

class MoonbeamDevNode extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.exec = opts.exec
    this.argv = opts.argv || ['--dev', '--tmp']

    this.process = child.spawn(this.exec, this.argv, { stdio: opts.stdio })
    this.started = new Promise(resolve => this.process.stdout.once('data', resolve))
    this.stopped = new Promise(resolve => this.process.on('exit', resolve))

    const stdout = new NewlineDecoder()
    const stderr = new NewlineDecoder()

    if (this.process.stdout) {
      this.process.stdout.on('data', data => {
        for (const line of stdout.push(data)) {
          this.emit('log', line, 'stdout')
        }
      })
    }

    if (this.process.stderr) {
      this.process.stderr.on('data', data => {
        for (const line of stderr.push(data)) {
          this.emit('log', line, 'stderr')
        }
      })
    }
  }

  kill () {
    this.process.kill()
  }
}

module.exports = async function (fn, opts) {
  const p = new MoonbeamDevNode(opts)

  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
  process.once('uncaughtException', stop)
  process.once('unhandledRejection', stop)

  p.on('log', line => {/*console.error(line)*/})

  // await p.started
  // DEBUG
  await new Promise(resolve => setTimeout(resolve, 1000))

  const wrapper = await connect(opts)

  await fn(wrapper)

  await stop()

  async function stop (ex) {
    if (ex) console.error(ex)
    p.kill()
    await p.stopped
  }
}
