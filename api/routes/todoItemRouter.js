const express = require('express');
const todoItemController = require('../controllers/todoItemController');

const todoItemRouter = express.Router();

todoItemRouter.get('/all', todoItemController.getAllTodoItems); // get all todo items
todoItemRouter.get('/id/:todoItemId', todoItemController.getTodoItemById); // get one todo item by id
todoItemRouter.get('/date/:datePlannedCompletion', todoItemController.getTodoItemsByPlannedCompletionDate); // get several todo items by date
todoItemRouter.post('/', todoItemController.postTodoItem); // add todo item
todoItemRouter.put('/:todoItemId', todoItemController.putTodoItemById); // update todo item (by id)
todoItemRouter.delete('/:todoItemId', todoItemController.deleteTodoItemById); // delete todo item (by id)

module.exports = todoItemRouter;
