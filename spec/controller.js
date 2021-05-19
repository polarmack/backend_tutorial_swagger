const router = (module.exports = require('express').Router());
const Todo = require('./schema/Todo');
const User = require('./schema/User');
const scrypt = require('./utils/scrypt');
const tokenHandler = require('./utils/auth');

router.get('/echo/echo_get', (req, res) => {
  res.json({ message: 'Echo from router...' });
});

router.get('/echo/echo_qs', (req, res) => {
  const query = req.query;
  res.json(query);
});

router.get('/echo/echo_params/:message', (req, res) => {
  const message = req.params.message;
  res.json({ params: message });
});

router.post('/echo/echo_post', (req, res) => {
  const body = req.body;
  console.log('1');
  console.log(body);
  res.json({ ...body });
});

router.get('/todos/no_auth/', async (req, res) => {
  let query;

  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query String
  let queryStr = JSON.stringify(reqQuery);

  // Create operator ($gt, $gte, $in)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => '$' + match
  );

  // Finding resource
  query = Todo.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('+order');
  }

  // Execute query
  const todos = await query;

  res.json({ succes: true, count: todos.length, data: todos });
});

router.get('/todos/no_auth/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return res.status(400).json({
      error: `Todo not found with id ${req.params.id}`,
      data: {},
    });
  }

  res.json({ succes: true, data: todo });
});

router.post('/todos/no_auth/', async (req, res) => {
  const todo = await Todo.create(req.body);

  res.json({ succes: true, data: todo });
});

router.put('/todos/no_auth/:id', async (req, res) => {
  const updateTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateTodo) {
    return res.status(400).json({
      error: `Todo not found with id ${req.params.id}`,
      data: {},
    });
  }

  res.json({ succes: true, data: updateTodo });
});

router.delete('/todos/no_auth/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);

  if (!todo) {
    return res.status(400).json({
      error: `Todo not found with id ${req.params.id}`,
      data: {},
    });
  }

  res.json({ succes: true, data: {} });
});

router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check exist user
  let checkUser = await User.findOne({
    email,
  }).select('_id');
  if (checkUser)
    return res
      .status(400)
      .json({ error: 'tel or email is already exists', data: {} });

  // Create user
  let user = await User.create({
    name,
    email,
    password: await scrypt.encrypt(password),
  });

  if (!user)
    return res.status(400).json({ error: 'cannoet create user', data: {} });

  let token = user.getSignedJwtToken();
  if (!token)
    return res.status(400).json({ error: 'cannot generate token', data: {} });

  res.status(200).cookie('token', token).json({ success: true, token });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ error: 'please provide an email or password', data: {} });

  // Check for user
  let user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ error: 'invalid email', data: {} });

  // Check match password
  let isMatchPassword = await scrypt.verifyPassword(password, user.password);
  if (!isMatchPassword)
    return res.status(401).send({ error: 'password is not match', data: {} });

  let token = user.getSignedJwtToken();
  if (!token)
    return res.status(400).json({ error: 'cannot generate token', data: {} });

  res.status(200).cookie('token', token).json({ success: true, token });
});

router.post('/todos', tokenHandler, async (req, res) => {
  const todo = await Todo.create(req.body);

  res.json({ succes: true, data: todo });
});

router.put('/todos/:id', tokenHandler, async (req, res) => {
  const updateTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateTodo) {
    return res.status(400).json({
      error: `Todo not found with id ${req.params.id}`,
      data: {},
    });
  }

  res.json({ succes: true, data: updateTodo });
});

router.delete('/todos/:id', tokenHandler, async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);

  if (!todo) {
    return res.status(400).json({
      error: `Todo not found with id ${req.params.id}`,
      data: {},
    });
  }

  res.json({ succes: true, data: {} });
});
