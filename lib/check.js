var http = require("http")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function _check(nodeUrl) {
  return new Promise(resolve => {
    http
      .request(nodeUrl, { method: "OPTIONS", timeout: 0 }, res => {
        res.once("error", () => resolve(false))
        if (res.statusCode !== 200) resolve(false)
        resolve(true)
      })
      .once("error", () => resolve(false))
      .end()
  })
}

module.exports = async function check(opts = {}) {
  var nodeUrl = opts.nodeUrl || "http://localhost:9933"
  var tries = opts.tries || 100
  var ms = opts.sleep || 50

  while (tries--) {
    if (await _check(nodeUrl)) return true
    if (!tries) break
    await sleep(ms)
  }

  throw Error("cannot connect to moonbeam node @ " + nodeUrl)
}
