'use strict'
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');

//GET /login
router.get('/login', function(req, res, next) {
  return res.render('login', {
    title: 'Login',
    error: req.flash('error'),
    // error_msg: req.flash('error_msg'),
    // success_msg: req.flash('success_msg')
  });
});

// GET user/register
router.get('/register', function(req, res, next) {
  return res.render('register', {
    title: 'Register'
  });
});

// POST /user/register
router.post('/register', function(req, res, next) {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  // Check if user did not fill out all inputs
  if (!username || !email || !password || !password2) {
    errors.push({msg: 'Please fill out all fields'})
  }

  // Check passwords
  if (password !== password2) {
    errors.push({msg: 'Passwords do not match!'});
  }

  if (password.length < 6) {
    errors.push ({msg: 'Password should be at least 6 characters long'});
  }

  if(errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      password,
      password2
    });
  }

  else {
    // Validation
    User.findOne({ email: email})
      .then(user => {
        if (user) {
          // user exists
            errors.push({msg: 'A user with that email already exists'})
            res.render('register', {
              errors,
              username,
              email,
              password,
              password2
            });
        } else {
          const newUser = new User({
            username: username,
            email: email,
            password: password
          });

          // Hash password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.session.message = 'Account successfully made';
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err));
          }));
        }
      });
  }
});

// POST /users/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// GET /users/logout
router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'You are now logged out')
  res.redirect('/users/login');
});



module.exports = router;
