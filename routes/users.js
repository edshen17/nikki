/* eslint-disable */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const {
  Post,
} = require('../models/Post');
const {
  Comment,
} = require('../models/Post');
const {
  ensureAuthenticated,
} = require('../config/auth');
const {
  ObjectId,
} = require('mongoose').Types;


// Accesses the id param and searches posts by id
router.param('id', (req, res, next, id) => {
  Post.findById(id, (err, post) => {
    if (err) return next(err);
    if (!post) {
      let error = err;
      error = new Error('Not Found');
      error.status = 404;
      return next(error);
    }
    req.post = post;
    return next();
  });
});

// GET /login
router.get('/login', (req, res) => {
  const title = 'Login';
  const error = req.flash('error');

  return res.render('login', {
    title,
    error,
  });
});

// GET users/register
router.get('/register', (req, res) => {
  const title = 'Register';
  return res.render('register', {
    title,
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
    failureFlash: true,
  })(req, res, next);
});

// GET /users/logout
router.get('/logout', (req, res) => {
  req.logout();
  res.status(301).redirect('/users/login');
});

// GET /users/:username
// Route for getting a specific user's profile
router.get('/:username', (req, res, next) => {
  User.find({
    username: req.params.username,
  }, 'bio username imageURL')
    .exec((err, users) => {
      if (err) return next(err);
      if (users.length === 0) {
        const error = new Error('User does not exist');
        error.status = 404;
        return next(error);
      }
      let loggedUser = null;
      const bio = users[0].bio;
      const username = req.params.username;

      if (req.user) { // if user is logged in, use session var to create a client-side user object (omitting email/password)           
        const imageURL = req.user.imageURL;
        const bio = req.user.bio;
        const _id = req.user.id;
        const username = req.user.username;
        loggedUser = {
          imageURL,
          bio,
          _id,
          username,
        };
      }
      return res.render('profile', {
        username,
        bio,
        loggedUser,
      });
    });
});

// POST /users/:username/
// Route for editing a user's profile information
router.post('/:username', (req, res, next) => {
  User.find({
    username: req.params.username,
  })
    .exec((err, user) => {
      if (err) return next(err);
      user.bio = req.body.bio;
      user.save(() => {
        if (err) return next(err);
        res.status(200).send(user);
      });
    });
});


// GET /users/:username/json
// Route for getting a specific user's json data
router.get('/:username/json', (req, res, next) => {
  User.find({
    username: req.params.username,
  }, 'bio username imageURL followers follwer_count following following_count comments comment_count posts post_count')
    .exec((err, user) => {
      if (err) return next(err);
      return res.status(200).json(user);
    });
});

// GET /users/:username/posts
// Route for getting all the posts of a user
router.get('/:username/posts', (req, res, next) => {
  Post.find({
    postedBy: req.params.username,
  })
    .sort({
      createdAt: -1,
    })
    .exec((err, posts) => {
      if (err) return next(err);
      res.status(200).json(posts);
    });
});


// GET /users/:username/posts/:id
// Route for getting a specific post
router.get('/:username/posts/:id', (req, res) => {
  res.send(req.post);
});

// POST /users/:username/posts
// Route for creating a post
router.post('/:username/posts', (req, res, next) => {
  const postedBy = req.params.username;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    postedBy,
    title,
    content,
  });

  post.save((err) => {
    if (err) return next(err);
    res.status(201).redirect(`/users/${postedBy}`);
  });
});

// POST /users/:username/posts
// Route for liking/unliking a post
router.post('/:username/posts/:id/like', (req, res, next) => {
  Post.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    post.likedBy = req.body.likedBy;
    post.save(() => {
      if (err) return next(err);
      res.status(200).send(post);
    });
  });
});

// DELETE /users/:username/posts/:id/
// Route for deleting a specific post
router.delete('/:username/posts/:id', (req, res, next) => {  
  req.post.remove(() => {
    var id = req.params.id;
    Comment.deleteMany({ parentID: id }, (err) => { // deletes all comments in the post as well 
      if (err) return next(err);
      req.post.save(() => {
        res.status(200).send();
       });
    })
  });
});

// POST /users/:username/posts/comment
// Route for creating a comment for a specific post
router.post('/:username/posts/:id/comment', (req, res, next) => {
  if (req.body.comments) { // if we already made the comment and are updating the comments array
    Post.findById(req.params.id, (err, post) => {
      if (err) return next(err);
      post.comments = req.body.comments; 
      post.save(() => {
        if (err) return next(err);
        res.status(200).json(post);
      });
    });
  } else { // creating a new comment
    const parentID = req.params.id;
    const postedBy = req.body.postedBy;
    const content = req.body.content;
    
    const comment = new Comment({
      parentID,
      postedBy,
      content,
    });

    comment.save((err) => {
      if (err) return next(err);
      res.status(200).json(comment);
    });
  }
});

// PUT /users/:username/posts/:id/
// Edit a specific post
router.put('/:username/posts/:id/', (req, res) => {
  return res.json({
    response: 'put request to edit a post',
    postId: req.params.id,
    commentId: req.params.cid,
    body: req.body,
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
