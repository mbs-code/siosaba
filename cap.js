var util = require('util')

function hookStdout (callback) {
  var oldWrite = process.stdout.write

  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(process.stdout, arguments)
      callback(string, encoding, fd)
    }
  })(process.stdout.write)

  return function () {
    process.stdout.write = oldWrite
  }
}

console.log('a')
console.log('b')

var unhook = hookStdout(function (string, encoding, fd) {
  util.debug('stdout: ' + util.inspect(string))
})

console.log('c')
console.log('d')

unhook()

console.log('e')
console.log('f')
