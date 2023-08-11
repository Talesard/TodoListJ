const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const todoItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, required: true, default: false },
  ownerUserId: { type: ObjectId, required: true },
  dateCreation: { type: Date, required: true, default: Date.now },
  datePlannedCompletion: { type: Date, required: true },
  __v: { type: Number, select: false },
});

module.exports = mongoose.model('TodoItem', todoItemSchema);
