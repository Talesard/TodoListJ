module.exports = {
  mongoUrl: 'mongodb://localhost:27017/todolist',
  appPort: 3000,
  secret: 'mysupersecretkey',
  jwtExpiresIn: '30m',
  clearBlackListOfExpiredTokensShedule: '/59 /59 /23 * * *', // every ~24h
};
