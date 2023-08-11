const jwt = require('jsonwebtoken');
const config = require('../config/config');
const TokenBlackList = require('../models/tokenBlackList');

exports.cookieJwtAuth = async (request, response, next) => {
  const { token } = request.cookies;
  console.log(token);
  try {
    const user = jwt.verify(token, config.secret);
    const tokenFromBlackList = await TokenBlackList.findOne({ token }).lean();
    if (tokenFromBlackList) throw new Error('token in BlackList');
    request.user = user;
    return next();
  } catch (err) {
    response.clearCookie('token');
    const responseJson = {
      status: 'fail',
      error: 'Unauthorized',
    };
    return response.status(401).json(responseJson);
  }
};
