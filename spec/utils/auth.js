const jwt = require('jsonwebtoken');
const User = require('../schema/User');

const tokenHandler = async (req, res, next) => {
  let token;

  let authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer')) {
    console.log('T1');
    token = authHeader.slice(7, authHeader.length);
  }

  if (!token)
    res
      .status(401)
      .json({ error: 'You are unauthorize to use this route', data: {} });

  try {
    let decode = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decode.user_id);
    console.log(req.user);
    next();
  } catch (e) {
    res
      .status(401)
      .json({ error: 'You are unauthorize to use this route', data: {} });
  }
};

module.exports = tokenHandler;
