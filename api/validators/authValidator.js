exports.validateUsername = (username) => {
  const result = {
    isValid: true,
    error: '',
  };
  if (!username || typeof (username) !== 'string' || username === '' || username.length < 4) {
    result.isValid = false;
    result.error = 'username not defined or empty string or not string or len < 4';
  }
  return result;
};

exports.validatePassword = (password) => {
  const minPasswordLength = 4;
  const result = {
    isValid: true,
    error: '',
  };
  if (!password || typeof (password) !== 'string' || password === '' || password.length < minPasswordLength) {
    result.isValid = false;
    result.error = 'password not defined or empty string or not string or len < 4';
  }
  return result;
};

exports.validateEmail = (email) => {
  const result = {
    isValid: true,
    error: '',
  };
  const isValidEmailPattern = String(email).toLowerCase().match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
  if (!email || typeof (email) !== 'string' || email === '' || !isValidEmailPattern) {
    result.isValid = false;
    result.error = 'email not defined or empty string or not string or incorrect pattern';
  }
  return result;
};
