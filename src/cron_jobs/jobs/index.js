const moment = require('moment')
const fs = require('fs').promises
const path = require('path')

exports.exampleJob = async () => {
  await fs.writeFile(
    path.resolve(__dirname, '.', 'logs.txt'),
    `Cron job run at:  ${moment().toDate().toISOString()} \n`
  )
}
