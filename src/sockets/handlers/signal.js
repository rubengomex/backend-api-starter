const db = require('../../database')
const { SocketClient } = require('../../services/socketClient')

exports.onSignal = ({ socket, io }) => async data => {
  const client = new SocketClient({ socket, io })
  const user = await db.model('user').getShort(socket.decoded_token.sub)
  client.toRoom({ room: user.lastOpenRoom, name: 'signal', data })
}
