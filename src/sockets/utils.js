const { CHAT_FORBIDDEN_REPLACE_MESSAGE } = require('./constants')

exports.messageParser = message => {
  const messageMail = this.validateEmail(message)
  // const messagePhone = this.validatePhoneNumber(messageMail)
  const messageSocial = this.validateSocialMedia(messageMail)
  return messageSocial
}

exports.validateEmail = text => {
  const re = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g

  return text.replace(re, CHAT_FORBIDDEN_REPLACE_MESSAGE)
}

exports.validatePhoneNumber = text => {
  const re = /[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{1,9}/gim
  return text.replace(re, '(phone number)')
}

exports.validateSocialMedia = text => {
  const re = /whatsapp|whatsap|whatapp|whatap|whtapp|whtap|whtspp|whtsp|whtsapp|whtsap|whapp|whutsapp|whutapp|whutsap|w h a t s a p p|w h a t s a p|wh atsapp|wh atsap|whts app|whats app|whts ap|w h t s a p p|w h t s a p|whats-app|whats-ap|whts-app|whts-ap|watts ap\.|skype|s kype|s k y p e|skpe|viber|instagram|instagrm|e’’mail|e-’’mail|@|\(at\)|\( a t \)|\( at\)|\(a t\)|\(at\.\)|\(a t\.\)|facebook|face book|fcbook|face-book|telegram|slack|outlook|twitter |yahoo|Icloud|Gmail|email|G-mail|googlemail/gi
  return text.replace(re, CHAT_FORBIDDEN_REPLACE_MESSAGE)
}

exports.validateSupport = text => {
  const re = /@support|@suport/gi

  if (re.test(text)) {
    // Open ticket for message.id
  }
}
