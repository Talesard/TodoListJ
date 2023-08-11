const scheduler = require('node-schedule');
const TokenBlackList = require('../models/tokenBlackList');
const config = require('../config/config');

const clearBlackListOfExpiredTokens = async () => {
  console.log('clear expired tokens from blacklist');
  try {
    await TokenBlackList.deleteMany({ tokenExpDate: { $lt: Date.now() } });
  } catch (err) {
    console.log('can\'t clear expired tokens from blacklist');
    console.log(err);
  }
};

const jobs = [
  {
    name: 'clear expired tokens from blacklist',
    schedule: config.clearBlackListOfExpiredTokensShedule,
    jobFunction: clearBlackListOfExpiredTokens,
  },
];

exports.registerSheduledJobs = () => {
  for (const job of jobs) {
    console.log(`Register job: ${job.name} with schedule: ${job.schedule}`);
    const resJob = scheduler.scheduleJob(job.schedule, job.jobFunction);
  }
};
