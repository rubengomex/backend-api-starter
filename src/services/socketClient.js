const db = require('../database')
const mailer = require('../mailer')
const { isEmail } = require('validator')

class SocketClient {
  constructor({ socket, io }) {
    this.socket = socket
    this.io = io
    this.user = socket.decoded_token.sub
    this.role = socket.decoded_token.role
  }

  zeroDate(d) {
    return d < 10 ? '0' + d : d
  }

  async setOnline() {
    await db.model('user').setOnline(this.user)
  }

  async setOffline() {
    if (!this.user) return
    await db.model('user').setOffline(this.user)
  }

  toSelf({ name, data }) {
    this.socket.emit(name, data)
  }

  async joinUser({ userId, roomId: chatRoomId }) {
    const c = await db.model('conversations').findOne({ where: { chatRoomId, userId } })

    if (c.removed || c.deleted) {
      c.removed = false
      c.deleted = false
      await c.save()
    }

    const sockets = await db.model('sockets').resolve(userId)
    if (!sockets) return
    const conversation = await db.model('conversations').get(chatRoomId, userId)

    sockets.forEach(s => {
      if (this.io.sockets.connected[s.connection]) {
        this.io.sockets.connected[s.connection].join(chatRoomId)
        this.io.sockets.connected[s.connection].emit('room:created', conversation)
      } else {
        this.io.to(s.connection).emit('room:created', conversation)
      }
    })
  }

  toRoom({ room, name, data }) {
    this.io.in(room).emit(name, data)
  }

  checkNotification({ list, code }) {
    const check = list.find(item => item.notification && item.notification.code === code)

    return (check && check.enabled) || false
  }

  findParticipants({ message }) {
    return db.model('chatParticipants').list(message.chatRoomId)
  }

  async attachMailing({ userId, code, template, subject, data, token }) {
    const user = await db.model('user').getWithNotifications(userId)

    if (!user) return
    if (token) data.token = token

    const notificationEnabled = this.checkNotification({ list: user.notificationSettings, code })

    if (notificationEnabled) {
      mailer.send(template, {
        to: isEmail(user.publicEmail + '') ? user.publicEmail : user.email,
        subject,
        data
      })
    }
  }

  fpFix(n) {
    return Math.round(n * 100) / 100
  }

  async checkConversation({ users, roomId }) {
    await Promise.all(
      users.map(async u => {
        if (u.userId !== this.user) {
          await this.joinUser({ userId: u.userId, roomId })
        }
      })
    )
  }

  async reply({ messageId }) {
    const message = await db.model('chatMessages').get(messageId)
    const participants = await this.findParticipants({ message })

    await this.checkConversation({ users: participants, roomId: message.chatRoomId })

    this.toRoom({ room: message.chatRoomId, name: 'message', data: message })

    return { participants, message }
  }

  async update({ messageId }) {
    const message = await db.model('chatMessages').get(messageId)
    const participants = await this.findParticipants({ message })

    this.toRoom({ room: message.chatRoomId, name: 'message:update', data: message })
    return { participants, message }
  }
}

module.exports = { SocketClient }
