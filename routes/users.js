'use strict'
const express = require('express');
const router = express.Router();

//GET /login
router.get('/login', function(req, res, next) {
  return res.render('login', {
    title: 'Login'
  });
});

// GET /register
router.get('/register', function(req, res, next) {
  return res.render('register', {
    title: 'Register'
  });
});

module.exports = router;
