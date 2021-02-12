var path = require('path')
var fs = require('fs')

fs.chmodSync(path.resolve(__dirname, './moonbeam-x86_64-unknown-linux-gnu'), 0o777)

// //TODO
// const get = require('simple-get')
// const crypto = require('crypto')
// const os = require('os')
// const fs = require('fs')
// const stream = require('stream')
// const path = require('path')

// var url
// var sha
// var exeName = 'openethereum.exe'
// const win32 = os.platform() === 'win32'

// switch (os.platform()) {
//   case 'win32':
//     url = 'https://github.com/openethereum/openethereum/releases/download/v3.0.1/openethereum-windows-v3.0.1.zip'
//     sha = win32Sha256
//     break
//   case 'darwin':
//     url = 'https://github.com/openethereum/openethereum/releases/download/v3.0.1/openethereum-macos-v3.0.1.zip'
//     sha = darwinSha256
//     break
//   case 'linux':
//     url = 'https://github.com/openethereum/openethereum/releases/download/v3.0.1/openethereum-linux-v3.0.1.zip'
//     sha = linuxSha256
//     break
//   default:
//     console.error('No parity binary found for:', os.platform())
//     process.exit(1)
// }

// get(url, function (err, res) {
//   if (err) {
//     console.error(err)
//     process.exit(1)
//   }

//   const tmpFile = path.resolve(__dirname, './openethereum.tmp')
//   const hash = crypto.createHash('sha256')

//   stream.pipeline(res, require('unzipper').Extract({ path: tmpFile }), function (err) {
//     if (err) {
//       console.error('Binary write failed')
//       console.error(err)
//       process.exit(1)
//     }

//     if (hash.digest('hex') !== sha) {
//       console.error('SHA-256 checksum mismatch')
//       process.exit(1)
//     }

//     fs.renameSync(path.join(tmpFile, 'openethereum' + (win32 ? '.exe' : '')), path.resolve(__dirname, exeName))
//     fs.chmodSync(path.resolve(__dirname, exeName), 0o777)
//   })

//   res.on('data', chunk => hash.update(chunk))
// })