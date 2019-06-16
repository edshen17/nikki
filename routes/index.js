'use strict'
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Passes user variable from passport session to all pages,
// allowing the navbar to show different links if user is logged in or not
router.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', {
    title: 'Home'
  });
});

// GET /dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res, next) {
  return res.render('dashboard', {
    title: 'Dashboard',
    username: req.user.username
   });
});

module.exports = router;
