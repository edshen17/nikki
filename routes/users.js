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

// Accesses the id param and searches posts by id
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
  const title = 'Login';
  const error = req.flash('error');

  return res.render('login', {
    title,
    error
  });
});

// GET users/register
router.get('/register', function(req, res, next) {
  const title = 'Register';
  return res.render('register', {
    title
  });
});

// POST /users/register
// Making a user in the db
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
  res.status(301).redirect('/users/login')
});

// GET /users/:username
// Route for getting a specific user's profile 
router.get('/:username', function(req, res, next) {
  User.find({username: req.params.username}, 'bio username imageURL')
      .exec(function(err, users) {
       
        if (err) return next(err); 
        if (users.length === 0) {
          err = new Error('User does not exist');
          err.status = 404;
          return next(err);
        }

        else {
          let loggedUser = null;
          const bio = users[0].bio;
          let username = req.params.username;

          if (req.user) { // if user is logged in, use session var to create a client-side user object (omitting email/password)
              
            const imageURL = req.user.imageURL;
            const bio = req.user.bio;
            const _id = req.user.id;
            const username = req.user.username;
            loggedUser = {
              imageURL,
              bio,
              _id,
              username 
            }
          } 
      
          return res.render('profile', {username, bio, loggedUser});
        }
      });
});

// GET /users/:username/json
// Route for getting a specific user's json data
router.get('/:username/json', function(req, res, next){
  User.find({username: req.params.username}, 'bio username imageURL')
      .exec(function(err, user) {
        if (err) return next(err);
        return res.status(200).json(user);
      });
});

// GET /users/:username/posts
// Route for getting all the posts of a user 
router.get('/:username/posts', function(req, res, next) {
  Post.find({postedBy: req.params.username})
    .sort({createdAt: -1})
    .exec(function(err, posts) {
      if (err) return next(err);
      res.status(200).json(posts);
    });
});


// GET /users/:username/posts/:id
// Route for getting a specific post
router.get('/:username/posts/:id', function(req, res, next) {
  res.send(req.post);
});

// POST /users/:username/posts
// Route for creating a post
router.post('/:username/posts', function(req, res, next) {
  const postedBy = req.params.username;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({ postedBy, title, content });

  post.save(function(err, post) {
    if (err) return next(err);
    res.status(201).send(post);
  });
});

// POST /users/:username/posts
// Route for liking/unliking a post
router.post('/:username/posts/:id/like', function(req, res, next) {
  Post.findById(req.params.id, function(err, post) {
    if (err) return next(err);
    else {
      post.likedBy = req.body.likedBy;
      post.save(function(err, post) {
        if (err) return next(err);
        res.status(200).send(post);
      });
    }
  });  
});

// DELETE /users/:username/posts/:id/
// Route for deleting a specific post
router.delete('/:username/posts/:id', function(req, res, next) {
  req.post.remove(function(err) {
    req.post.save(function(err, post) {
      if (err) return next(err);
      res.status(200).send()
    });
  });
});

// POST /users/:username/posts/comment
// Route for creating a comment for a specific post
router.post('/:username/posts/:id/comment', function(req, res, next) {
  if (req.body.comments) { // if we already made the comment and are updating the comments array
    Post.findById(req.params.id, function(err, post) {
      if (err) return next(err);
      post.comments = req.body.comments;
      post.save(function(err, post) {
        if (err) return next(err);
        res.status(200).json(post);
      });
    });
  } else {
    const postedBy = req.body.postedBy;
    const content = req.body.content;
    const comment = new Comment({ postedBy, content });
    comment.save(function(err, comment) {
      if (err) return next(err);
      res.status(200).json(comment);
    });
  }
  
  
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
