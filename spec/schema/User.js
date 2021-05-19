const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    validate: {
      validator: (val) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val),
      message: (props) => `${props.value} validation error`,
    },
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    select: false,
  },
  createdAt: { type: Date, default: new Date() },
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ user_id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', UserSchema);
