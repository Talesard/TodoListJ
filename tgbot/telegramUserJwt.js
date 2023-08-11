const mongoose = require('mongoose');

const telegramUserJwtSchema = new mongoose.Schema({
  userid: { type: String, required: true, unique: true },
  token: { type: String },
});

module.exports = mongoose.model('telegramUserJwt', telegramUserJwtSchema);
