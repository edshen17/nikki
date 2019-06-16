'use strict'
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post').Post;
const Comment = require('../models/Post').Comment;
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const ObjectId = require('mongoose').Types.ObjectId; 

router.param('id', function(req, res, next, id) {
  Post.findById(id, function(err, post) {
    if (err) return next(err);
    if (!post) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    }
    req.post = post;
    return next();
  });
});

//GET /login
router.get('/login', function(req, res, next) {
  return res.render('login', {
    title: 'Login',
    error: req.flash('error')
  });
});

// GET users/register
router.get('/register', function(req, res, next) {
  return res.render('register', {
    title: 'Register'
  });
});

// POST /users/register
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
            errors.push({msg: 'A user with that email already exists'});
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
                  req.login(user, function(err) {
                    if (err) {
                      console.log(err);
                    } else {
                      return res.redirect('/dashboard');
                    }
                  })
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
  // req.flash('success_msg', 'You are now logged out')
  res.status(301).redirect('/users/login')
});

// GET /users/:id
// Route for getting a specific user's profile
router.get('/:username', function(req, res, next) {
  return res.json({username: req.params.username})
});

// GET /users/:username/posts
// Route for getting all the posts
router.get('/:username/posts', function(req, res, next) {
  Post.find({})
    .sort({createdAt: -1})
    .exec(function(err, posts) {
      if (err) return next(err);
      res.json(posts);
    });
});

// GET /users/:username/posts/:id
// Route for getting a specific post
router.get('/:username/posts/:id', function(req, res, next) {
  res.json(req.post);
});


// POST /users/:username/posts
// Route for creating a post
router.post('/:username/posts', function(req, res, next) {
  const post = new Post({
    text: req.text
  });
  post.save(function(err, post) {
    if (err) return next(err);
    res.status(201);
    res.json(post);
  });
});


// PUT /users/:username/posts/:id/:cid
// Edit a specific comment
// router.put('/:username/posts/:id/:cid', function(req, res, next) {
//   return res.json({
//     response: 'put request to edit a comment',
//     postId: req.params.id,
//     commentId: req.params.cid,
//     body: req.body
//   });

// });

// DELETE /users/:username/posts/:id/:cid
// Delete a specific comment
// router.delete('/:username/posts/:id/:cid', function(req, res, next) {
//   return res.json({
//     response: 'DELETE request to delete a comment',
//     postId: req.params.id,
//     commentId: req.params.cid
//   });
// });



module.exports = router;
