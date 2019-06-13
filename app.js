const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes/index.js');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const app = express();


// Bodyparser
app.use(bodyParser.urlencoded({
  extended: false
}));

// DB
const db = require('./config/keys').MongoURI;

// Connect to Mongo DB
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.log(err));

// PUG
app.engine('pug', require('pug').__express)
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'pug');

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


// Express session
app.use(session({
  secret: 'env-secret-goes-here',
  resave: true,
  saveUninitialized: true,
}));

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
})

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
