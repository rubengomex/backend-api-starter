const { onConnect, onDisconnect } = require('./handlers/session')
const { onSignal } = require('./handlers/signal')

exports.initialize = io => {
  io.sockets.on('connection', socket => {
    // Connect handler
    onConnect({ socket, io })
    // Disconnect handler
    socket.on('disconnect', onDisconnect({ socket, io }))
    // Signal handler
    socket.on('signal', onSignal({ socket, io }))
  })
}
