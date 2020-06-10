const sendgrid = require('sendgrid')
const config = require('../configuration')
const helper = sendgrid.mail

class Mailer extends helper.Mail {
  constructor({ opts: { subject, recipients }, content }) {
    super()

    this.sgApi = sendgrid(config.get('SEND_GRID_API_KEY'))
    this.from_email = new helper.Email('no-reply@backend-api-starter.com')
    this.subject = subject
    this.body = new helper.Content('text/html', content)
    this.recipients = recipients.map(({ email }) => new helper.Email(email))

    this.addContent(this.body) // send grid internal method
    this.addClickTracking() // add click tracking
    this.addRecipients()
  }

  // custom method
  addClickTracking() {
    const trackingSettings = new helper.TrackingSettings()
    const clickTracking = new helper.ClickTracking(true, true)

    trackingSettings.setClickTracking(clickTracking)
    // send grid internal method
    this.addTrackingSettings(trackingSettings)
  }

  // custom method
  // personalization property
  addRecipients() {
    const personalize = new helper.Personalization()
    this.recipients.forEach(recipient => personalize.addTo(recipient))

    // send grid internal method
    this.addPersonalization(personalize)
  }

  // Custom method
  async send() {
    const request = this.sgApi.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: this.toJSON()
    })

    const response = await this.sgApi.API(request)
    return response
  }
}

module.exports = exports = Mailer
