const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  order: { type: Number, default: 1 },
  title: { type: String, required: [true, 'Please add a title'] },
  createdAt: { type: Date, default: new Date() },
});

TodoSchema.pre('save', async function (next) {
  var maxTodo = await TodoModel.countDocuments();
  if (!maxTodo) next();

  maxTodo = await TodoModel.find().sort('-order').limit(1);
  this.order = maxTodo[0].order + 1;

  next();
});

var TodoModel = mongoose.model('Todo', TodoSchema);

module.exports = TodoModel;
