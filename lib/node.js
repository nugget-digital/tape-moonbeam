var child = require("child_process")
var NewlineDecoder = require("newline-decoder")
var EventEmitter = require("events")
var check = require("./check.js")

export default class MoonbeamDevNode extends EventEmitter {
  constructor(opts = {}) {
    super()

    this.exec = opts.exec
    this.argv = opts.argv || ["--dev", "--tmp"]

    this.process = child.spawn(this.exec, this.argv, { stdio: opts.stdio })
    this.started = await check()
    this.stopped = new Promise(resolve => this.process.on("exit", resolve))

    var stdout = new NewlineDecoder()
    var stderr = new NewlineDecoder()

    if (this.process.stdout) {
      this.process.stdout.on("data", data => {
        for (var line of stdout.push(data)) {
          this.emit("log", line, "stdout")
        }
      })
    }

    if (this.process.stderr) {
      this.process.stderr.on("data", data => {
        for (var line of stderr.push(data)) {
          this.emit("log", line, "stderr")
        }
      })
    }
  }

  kill() {
    this.process.kill()
  }
}
