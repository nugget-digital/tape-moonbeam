function nightmare(ms, err) {
  return new Promise((_, reject) => setTimeout(reject.bind(null, err), ms))
}

module.exports = Promise.race([
  new Promise(function (resolve) {
    var check = function (line) {
      if (/Development Service Ready/.test(line)) {
        this.off("log", check)
        resolve(true)
      }
    }.bind(this)
    this.on("log", check)
  }),
  nightmare(3000, Error(""))
])

// var http = require("http")

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// function _check(url) {
//   return new Promise(resolve => {
//     http
//       .request(url, { method: "OPTIONS", timeout: 0 }, res => {
//         res.once("error", () => resolve(false))
//         if (res.statusCode !== 200) resolve(false)
//         resolve(true)
//       })
//       .once("error", () => resolve(false))
//       .end()
//   })
// }

// module.exports = async function check({
//   port,
//   _url = `http://localhost:${port +2}`,
//   tries = 10,
//   sleep: ms = 100
// }) {
//   console.log(_url)
//   while (tries--) {
//     console.log(tries)
//     if (await _check(_url)) return true
//     if (!tries) break
//     await sleep(ms)
//   }
//   throw Error("cannot connect to moonbeam node @ " + _url)
// }
