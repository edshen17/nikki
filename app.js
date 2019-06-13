const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes/index.js');
const app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));
app.engine('pug', require('pug').__express)
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'pug');

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.use(session({
  secret: 'env-secret-goes-here',
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());

// 404 error
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.listen(3000, function() {
  console.log('Express app listening on port 3000');
});
