var child = require("child_process")
var NewlineDecoder = require("newline-decoder")
var EventEmitter = require("events")
var check = require("./check.js")

module.exports = class MoonbeamDevNode extends EventEmitter {
  constructor(opts) {
    super()

    this.execPath = opts.execPath
    this.argv = opts.argv || [
      `--execution=Native`, // Faster execution using native
      `--no-telemetry`,
      `--no-prometheus`,
      `--dev`,
      `--sealing=manual`,
      `--port=${opts.port}`,
      `--rpc-port=${opts.rpcPort}`,
      `--ws-port=${opts.wsPort}`,
      `--tmp`
    ]

    this.process = child.spawn(this.execPath, this.argv, { stdio: opts.stdio })
    this.started = check()
    this.stopped = new Promise(resolve => this.process.on("exit", resolve))

    var stdout = new NewlineDecoder()
    var stderr = new NewlineDecoder()

    this.process.stdout?.on("data", data => {
      for (var line of stdout.push(data)) this.emit("log", line, "stdout")
    })

    this.process.stderr?.on("data", data => {
      for (var line of stderr.push(data)) this.emit("log", line, "stderr")
    })
  }

  kill() {
    this.process.kill()
  }
}
