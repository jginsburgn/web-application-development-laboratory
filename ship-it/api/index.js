const express = require('express');
const router = express.Router();

// Prepare db
require('./database');

// Require endpoints
const users = require('./users');
const items = require('./items').root;

// Mount endpoints
router.use('/users', users);
router.use('/items', items);

module.exports = router;
