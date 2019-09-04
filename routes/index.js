const express = require('express');

const router = express.Router();
const {
  ensureAuthenticated,
} = require('../config/auth');

// Passes user variable from passport session to all pages,
// allowing the navbar to show different links if user is logged in or not
router.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// GET /
router.get('/', (req, res) => {
  const title = 'Home | Nikki';
  return res.render('index', {
    title,
  });
});

// GET /dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  const title = `${req.user.username} | Dashboard`;
  const username = req.user.username;
  return res.render('dashboard', {
    title,
    username,
  });
});

module.exports = router;