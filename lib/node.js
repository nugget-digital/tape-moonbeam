var child = require("child_process")
var NewlineDecoder = require("newline-decoder")
var EventEmitter = require("events")

module.exports = class MoonbeamDevNode extends EventEmitter {
  constructor(opts) {
    super()

    this.maxStartMs = opts.maxStartMs
    this.execPath = opts.execPath
    this.argv = opts.argv

    this.process = child.spawn(this.execPath, this.argv, { stdio: opts.stdio })
    this.started = this.hasStarted()
    this.stopped = new Promise(resolve => this.process.once("exit", resolve))

    var stdout = new NewlineDecoder()
    var stderr = new NewlineDecoder()

    this.process.stdout?.on(  "data", chunk => {for (var line of stdout.push(chunk)) this.emit("log", line, "stdout")})

    this.process.stderr?.on( "data", chunk => {for (var line of stderr.push(chunk)) this.emit("log", line, "stderr")})
  }

  hasStarted() {
    return Promise.race([
      new Promise(resolve => {
          var check = line => {
            if (/Development Service Ready/.test(line)) {
              this.off("log", check)
              resolve(true)
            }
          }
          this.on("log", check)
        }
      ),
      new Promise((_, reject)=>           setTimeout(() => reject(Error("connection timeout after" + this.maxStartMs)),
      this.maxStartMs
    )
      )
    ])
  }

  kill() {
    this.process.kill()
  }
}
