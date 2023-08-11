const jwt = require('jsonwebtoken');
const authValidator = require('../validators/authValidator');
const User = require('../models/user');
const TokenBlackList = require('../models/tokenBlackList');
const authUtils = require('../utils/authUtils');
const config = require('../config/config');

exports.login = async (request, response) => {
  const { username, password } = request.body;
  const { token } = request.cookies;

  const responseJson = {};

  if (token) {
    try {
      const user = jwt.verify(token, config.secret);
      responseJson.status = 'fail';
      responseJson.error = `Already authorized as ${user.username}`;
      return response.status(400).json(responseJson);
    } catch (err) {
      // pass
    }
  }

  const usernameValidationResult = authValidator.validateUsername(username);
  if (!usernameValidationResult.isValid) {
    responseJson.status = 'fail';
    responseJson.error = usernameValidationResult.error;
    return response.status(400).json(responseJson);
  }
  const passwordValidationResult = authValidator.validatePassword(password);
  if (!passwordValidationResult.isValid) {
    responseJson.status = 'fail';
    responseJson.error = passwordValidationResult.error;
    return response.status(400).json(responseJson);
  }

  let user;
  try {
    user = await User.findOne({ username }).lean();
  } catch (err) {
    const errMessage = 'Can\'t get user by username';
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    console.log(errMessage, err);
    return response.status(500).json(responseJson);
  }
  if (!user) {
    const errMessage = 'Can\'t find user by username';
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(404).json(responseJson);
  }

  const isPasswordsEqual = await authUtils.checkPassword(password, user.password);
  if (isPasswordsEqual) {
    delete user.password; // we don't need to have an encoded password in the token
    const newToken = jwt.sign(user, config.secret, { expiresIn: config.jwtExpiresIn });
    response.cookie('token', newToken, {
      httpOnly: true,
      // secure: true,
      // maxAge: 1000000,
      // signed: true,
    });
    responseJson.status = 'ok';
    responseJson.token = newToken;
    return response.status(200).json(responseJson);
  }
  const errMessage = 'invalid password';
  responseJson.status = 'fail';
  responseJson.error = errMessage;
  return response.status(403).json(responseJson);
};

exports.logout = async (request, response) => {
  const { token } = request.cookies;
  try {
    const tokenExpDate = new Date(request.user.exp * 1000);
    const tokenToBlackList = new TokenBlackList({ token, tokenExpDate });
    await tokenToBlackList.save();
  } catch {
    const responseJson = { status: 'fail', error: 'Can\'t add token to blackList' };
    return response.status(500).json(responseJson);
  }
  const responseJson = { status: 'ok' };
  return response.status(200).clearCookie('token').json(responseJson);
};

exports.register = async (request, response) => {
  const { username, password, email } = request.body;
  const responseJson = {};

  const usernameValidationResult = authValidator.validateUsername(username);
  if (!usernameValidationResult.isValid) {
    responseJson.status = 'fail';
    responseJson.error = usernameValidationResult.error;
    return response.status(400).json(responseJson);
  }

  let tmpUser;
  try {
    tmpUser = await User.findOne({ username }).lean();
  } catch (err) {
    const errMessage = 'can\'t check the presence of a username in the database';
    console.log(errMessage, err);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(500).json(responseJson);
  }
  if (tmpUser) {
    responseJson.status = 'fail';
    responseJson.error = 'user with this name already exists';
    return response.status(400).json(responseJson);
  }

  const emailValidationResult = authValidator.validateEmail(email);
  if (!emailValidationResult.isValid) {
    responseJson.status = 'fail';
    responseJson.error = emailValidationResult.error;
    return response.status(400).json(responseJson);
  }
  try {
    tmpUser = await User.findOne({ email }).lean();
  } catch (err) {
    const errMessage = 'can\'t check the presence of a email in the database';
    console.log(errMessage, err);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(500).json(responseJson);
  }
  if (tmpUser) {
    responseJson.status = 'fail';
    responseJson.error = 'user with this email already exists';
    return response.status(400).json(responseJson);
  }

  const passwordValidationResult = authValidator.validatePassword(password);
  if (!passwordValidationResult.isValid) {
    responseJson.status = 'fail';
    responseJson.error = passwordValidationResult.error;
    return response.status(400).json(responseJson);
  }

  const passwordHash = await authUtils.hashPassword(password);
  const user = new User({ username, email, password: passwordHash });
  try {
    await user.save();
  } catch (err) {
    const errMessage = 'can\'t save new user';
    console.log(errMessage, err);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(500).json(responseJson);
  }
  responseJson.status = 'ok';
  return response.status(200).json(responseJson);
};
