const crypto = require('crypto');

exports.hashPassword = async (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(password, salt, 64, (err, derivedKey) => {
    if (err) reject(err);
    resolve(`${salt}:${derivedKey.toString('hex')}`);
  });
});

exports.checkPassword = async (password, hashPassword) => new Promise((resolve, reject) => {
  const [salt, key] = hashPassword.split(':');
  crypto.scrypt(password, salt, 64, (err, derivedKey) => {
    if (err) reject(err);
    resolve(key === derivedKey.toString('hex'));
  });
});
