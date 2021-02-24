var http = require("http")
var util = require("util")

var request = util.promisify(http.request)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = async function check(opts = {}) {
  opts.nodeUrl = opts.nodeUrl || "http://localhost:9933"
  opts.tries = opts.tries || 100
  opts.sleep = opts.sleep || 50

  while (opts.tries--) {
    var res
    try { res = await request(opts.nodeUrl, { method: "OPTIONS" }) } catch(_) {}
    if (res && res.statusCode === 200) return true
    if (tries === 0 || tries === NaN) break
    await sleep(opts.sleep)
  }

  return false
}
