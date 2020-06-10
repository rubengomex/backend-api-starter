const config = require('configuration')
module.exports = dummy => {
  return `
    <html>
      <body>
        <div style="text-align: center;">
          <h3>I'd like your input!</h3>
          <p>Dummy Template:</p>
          <p>${dummy.body}</p>
          <div>
          <a href="${config.REDIRECT_DOMAIN}/v1/thanks">Yes</a>
          </div>
          <div>
          <a href="${config.REDIRECT_DOMAIN}/v2/thanks">No</a>
          </div>
        </div>
      </body>
    </html>`
}
