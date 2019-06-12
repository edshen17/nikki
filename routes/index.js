'use strict'
const express = require('express');
const router = express.Router();
module.exports = router;

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', {
    title: 'Home'
  });
});

// GET /login
router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'Login'
  });
});
