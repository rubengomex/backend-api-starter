const db = require('../../database')
const { SocketClient } = require('../../services/socketClient')

exports.onConnect = async ({ socket, io }) => {
  const client = new SocketClient({ socket, io })

  await db.model('sockets').onConnect(socket.id, socket.decoded_token.sub)
  const [, conversations] = await Promise.all([
    client.setOnline(),
    db.model('conversations').getShortList(socket.decoded_token.sub)
  ])

  conversations.forEach(c => socket.join(c.chatRoomId))
}

exports.onDisconnect = ({ socket, io }) => async () => {
  if (!socket.decoded_token) return
  const client = new SocketClient({ socket, io })

  io.emit('user:status', { user: socket.decoded_token.sub, status: 0 })
  await db.model('sockets').onDisconnect(socket.id, socket.decoded_token.sub)
  const [sockets] = await Promise.all([db.model('sockets').resolve(socket.decoded_token.sub), client.setOffline()])

  if (!sockets || (sockets && sockets.length <= 3)) return

  await Promise.all(
    sockets.map(async s => {
      if (!io.sockets.connected[s.connection]) {
        await db.model('sockets').onDisconnect(s.connection, socket.decoded_token.sub)
      }
    })
  )
}
