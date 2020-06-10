const schedule = require('node-schedule')
const jobs = require('./jobs')

// Runs a schedule job
exports.initialize = function () {
  schedule.scheduleJob('* * * * * *', () => jobs.exampleJob())
}
