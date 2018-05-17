const express = require('express');
const app = express();

const api = require('./api');

app.use('/api', api);

app.listen(80, () => console.log('Server up!'));