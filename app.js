const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// first use local ENV, else hit the remote one
let ENV;
try {
  ENV = require('./env');
} catch (ex) {
  ENV = process.env;
}

const users = require('./routes/users');

const app = express();
// connects react app to the backend
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

mongoose.connect(ENV.MONGODB_URI);

app.use('/api/v1/users', users);

module.exports = app;
