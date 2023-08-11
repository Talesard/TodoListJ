const { ObjectId } = require('mongodb');

exports.validateTodoItemId = (todoItemId) => {
  const result = {
    isValid: true,
    error: '',
  };
  let canCast = true;
  try {
    ObjectId(todoItemId);
  } catch {
    canCast = false;
  }
  if (!todoItemId || typeof (todoItemId) !== 'string' || todoItemId === '' || !canCast) {
    result.isValid = false;
    result.error = 'todoItemId not defined or empty string or not string or not ObjectId format';
  }
  return result;
};

exports.validateTodoItemText = (todoItemText) => {
  const result = {
    isValid: true,
    error: '',
  };
  if (!todoItemText || typeof (todoItemText) !== 'string' || todoItemText === '') {
    result.isValid = false;
    result.error = 'text not defined or empty string or not string';
  }
  return result;
};

exports.validateTodoItemIsCompleted = (isCompleted) => {
  const result = {
    isValid: true,
    error: '',
  };
  if (isCompleted === undefined || typeof (isCompleted) !== 'boolean') {
    result.isValid = false;
    result.error = 'isCompleted not defined or empty string or not string';
  }
  return result;
};

exports.validateTodoItemDatePlannedCompletion = (datePlannedCompletion) => {
  const result = {
    isValid: true,
    parsedDate: undefined,
    error: '',
  };
  const parsedDatePlannedCompletion = Date.parse(datePlannedCompletion);
  if (!datePlannedCompletion || datePlannedCompletion === '' || Number.isNaN(parsedDatePlannedCompletion)) {
    result.isValid = false;
    result.error = 'datePlannedCompletion not defined or empty string or unknown date format';
  } else {
    result.parsedDate = parsedDatePlannedCompletion;
  }
  return result;
};
