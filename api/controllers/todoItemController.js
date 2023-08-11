const TodoItem = require('../models/todoItem');
const Validator = require('../validators/todoItemValidator');

exports.getAllTodoItems = async (request, response) => {
  response.set('Cache-Control', 'no-store');
  let allTodoItems;
  const ownerUserId = request.user._id;
  try {
    // lean query get js object instead mongo document
    allTodoItems = await TodoItem.find({ ownerUserId }).lean();
  } catch (err) {
    const errMessage = 'Can\'t get all todo items';
    console.log(errMessage, err);
    return response.status(500).json({
      status: 'fail',
      error: errMessage,
    });
  }
  return response.status(200).json({
    status: 'ok',
    todoItems: allTodoItems,
  });
};

exports.getTodoItemById = async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const { todoItemId } = request.params;
  const ownerUserId = request.user._id;
  let todoItem;
  const responseJson = {};
  const idValidationResult = Validator.validateTodoItemId(todoItemId);
  if (!idValidationResult.isValid) {
    responseJson.status = 'fail';
    responseJson.error = idValidationResult.error;
    return response.status(400).json(responseJson);
  }
  try {
    todoItem = await TodoItem.findOne({ _id: todoItemId, ownerUserId }).lean();
  } catch (err) {
    const errMessage = 'Can\'t get todo item by id';
    console.log(errMessage, err);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(500).json(responseJson);
  }
  if (!todoItem) {
    const errMessage = 'Can\'t find todo item';
    console.log(errMessage);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    response.status(404);
  } else {
    responseJson.status = 'ok';
    responseJson.todoItem = todoItem;
    response.status(200);
  }
  return response.json(responseJson);
};

exports.getTodoItemsByPlannedCompletionDate = async (request, response) => {
  response.set('Cache-Control', 'no-store');
  const { datePlannedCompletion } = request.params;
  const ownerUserId = request.user._id;
  let todoItems;
  const responseJson = {};
  try {
    const dateValidationResult = Validator.validateTodoItemDatePlannedCompletion(
      datePlannedCompletion,
    );
    if (!dateValidationResult.isValid) {
      response.status(400);
      throw new Error(dateValidationResult.error);
    }
    try {
      todoItems = await TodoItem.find({
        datePlannedCompletion: dateValidationResult.parsedDate,
        ownerUserId,
      }).lean();
    } catch (err) {
      console.error(err);
      response.status(500);
      throw new Error('Can\'t save todo item');
    }
  } catch (err) {
    const errMessage = err.message;
    console.log(errMessage);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.json(responseJson);
  }
  responseJson.status = 'ok';
  responseJson.todoItems = todoItems;
  return response.status(200).json(responseJson);
};

exports.postTodoItem = async (request, response) => {
  const { text, datePlannedCompletion } = request.body;
  let todoItem;
  const ownerUserId = request.user._id;
  const responseJson = {};
  try {
    const textValidationResult = Validator.validateTodoItemText(text);
    if (!textValidationResult.isValid) {
      response.status(400);
      throw new Error(textValidationResult.error);
    }
    const dateValidationResult = Validator.validateTodoItemDatePlannedCompletion(
      datePlannedCompletion,
    );
    if (!dateValidationResult.isValid) {
      response.status(400);
      throw new Error(dateValidationResult.error);
    }
    try {
      todoItem = new TodoItem({
        text,
        datePlannedCompletion: dateValidationResult.parsedDate,
        ownerUserId,
      });
      await todoItem.save();
    } catch (err) {
      console.log(err);
      response.status(500);
      throw new Error('Can\'t save todo item');
    }
  } catch (err) {
    const errMessage = err.message;
    console.log(errMessage);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.json(responseJson);
  }
  responseJson.status = 'ok';
  return response.status(200).json(responseJson);
};

exports.putTodoItemById = async (request, response) => {
  const {
    text, datePlannedCompletion, isCompleted,
  } = request.body;
  const { todoItemId } = request.params;
  const ownerUserId = request.user._id;
  const responseJson = {};
  const valuesForUpdate = {};
  let errMessage = '';

  const idValidationResult = Validator.validateTodoItemId(todoItemId);
  if (!idValidationResult.isValid) {
    console.log(idValidationResult.error);
    responseJson.status = 'fail';
    responseJson.error = idValidationResult.error;
    return response.status(400).json(responseJson);
  }

  const textValidationResult = Validator.validateTodoItemText(text);
  if (textValidationResult.isValid) {
    valuesForUpdate.text = text;
  } else {
    errMessage += textValidationResult.error;
  }

  const dateValidationResult = Validator.validateTodoItemDatePlannedCompletion(
    datePlannedCompletion,
  );
  if (dateValidationResult.isValid) {
    valuesForUpdate.datePlannedCompletion = dateValidationResult.parsedDate;
  } else {
    errMessage += dateValidationResult.error;
  }

  const isCompletedValidationResult = Validator.validateTodoItemIsCompleted(isCompleted);
  if (isCompletedValidationResult.isValid) {
    valuesForUpdate.isCompleted = isCompleted;
  } else {
    errMessage += isCompletedValidationResult.error;
  }

  if (Object.keys(valuesForUpdate).length < 1) {
    console.log(errMessage);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(400).json(responseJson);
  }

  try {
    await TodoItem.findOneAndUpdate({ _id: todoItemId, ownerUserId }, valuesForUpdate);
  } catch (err) {
    console.log(err);
    responseJson.status = 'fail';
    responseJson.error = 'Can\'t update todo item';
    return response.status(500).json(responseJson);
  }

  responseJson.status = 'ok';
  return response.status(200).json(responseJson);
};

exports.deleteTodoItemById = async (request, response) => {
  const { todoItemId } = request.params;
  const responseJson = {};
  const ownerUserId = request.user._id;

  const idValidationResult = Validator.validateTodoItemId(todoItemId);
  if (!idValidationResult.isValid) {
    console.log(idValidationResult.error);
    responseJson.status = 'fail';
    responseJson.error = idValidationResult.error;
    return response.status(400).json(responseJson);
  }

  try {
    await TodoItem.findOneAndDelete({ todoItemId, ownerUserId });
  } catch (err) {
    const errMessage = 'Can\'t delete todo item by id';
    console.log(errMessage, err);
    responseJson.status = 'fail';
    responseJson.error = errMessage;
    return response.status(500).json(responseJson);
  }
  responseJson.status = 'ok';
  return response.status(200).json(responseJson);
};
