const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

// General utilites
const utils = require('../utils');

// Get users workhorse
const users = require('./users');

// Body parser
const jsonParser = bodyParser.json();

// Require endpoints
const items = require('../items').usersRouter;

// Mount items endpoints
router.use('/:user/items', items);

router.post('/', jsonParser, async function(req, res) {
  console.log(`Create user ${JSON.stringify(req.body, null, 2)}`);
  try {
    await users.createUser(req.body);
  }
  catch (e) {
    switch (e.message) {
      case 'bad_request':
      res.sendStatus(400);
      return;
      break;
      case 'collision':
      res.sendStatus(409);
      return;
      break;
    }
  }
  res.send();
});

router.get('/:user', async function(req, res) {
  console.log(`Get user details ${req.params.user}`);
  const header = req.get('Authorization');
  if (header == undefined) {
    res.sendStatus(401);
    return;
  }
  const token = utils.getTokenFromHeader(req.get('authorization'));
  if (await users.validateSession(req.params.user, token)) {
    const user = await users.getUser(req.params.user);
    delete user._id;
    delete user.hash;
    res.send(user);
    return;
  }
  res.sendStatus(401);
});

router.post('/:user/sessions', jsonParser, async function(req, res) {
  console.log(`Login user ${req.params.user}. Payload ${JSON.stringify(req.body, null, 2)}`);
  if (req.body.password == undefined) {
    res.sendStatus(400);
    return;
  }
  try {
    const token = await users.createSession(req.params.user, req.body.password);
    res.send({ token });
  }
  catch (e) {
    switch (e.message) {
      case 'user_does_not_exist':
      res.sendStatus(404);
      return;
      case 'invalid_password':
      res.sendStatus(401);
    }
  }
});

router.delete('/:user/sessions', function(req, res) {
  console.log('Close all user sessions:', req.params.user);
  res.sendStatus(501);
});

router.delete('/:user/sessions/:token', async function(req, res) {
  console.log(`Logout user ${req.params.user}. Token ${req.params.token}`);
  try {
    await users.destroySession(req.params.user, req.params.token);
    res.send();
  }
  catch (e) {
    switch (e.message) {
      case 'user_does_not_exist':
      res.sendStatus(404);
      return;
      case 'session_does_not_exist':
      res.sendStatus(404);
    }
  }
});

module.exports = router;