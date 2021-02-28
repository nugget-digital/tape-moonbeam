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

    this.process.stdout?.on(
      "data",
      function (data) {
        for (var line of stdout.push(data)) this.emit("log", line, "stdout")
      }.bind(this)
    )

    this.process.stderr?.on(
      "data",
      function (data) {
        for (var line of stderr.push(data)) this.emit("log", line, "stderr")
      }.bind(this)
    )
  }

  hasStarted() {
    return Promise.race([
      new Promise(
        function (resolve) {
          var check = function (line) {
            if (/Development Service Ready/.test(line)) {
              this.off("log", check)
              resolve(true)
            }
          }.bind(this)
          this.on("log", check)
        }.bind(this)
      ),
      new Promise(
        function (_, reject) {
          setTimeout(
            reject.bind(
              null,
              Error("connection timeout after" + this.maxStartMs)
            ),
            this.maxStartMs
          )
        }.bind(this)
      )
    ])
  }

  kill() {
    this.process.kill()
  }
}
