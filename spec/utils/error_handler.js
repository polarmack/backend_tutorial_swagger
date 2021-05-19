const mongoose = require('mongoose');
const { ValidationError, CastError } = mongoose.Error;

module.exports = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, data: {} });
  }

  if (err instanceof CastError) {
    return res.status(400).json({ error: err.message, data: {} });
  }

  res
    .status(err.status || 500)
    .json({ error: err.message || 'Unhandle error', data: {} });
};
