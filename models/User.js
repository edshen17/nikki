'use strict';
const mongoose = require('mongoose');
const Post = require('../models/Post').Post;
const PostSchema = mongoose.model('Post').schema;
const Comment = require('../models/Post').Comment;
const CommentSchema = mongoose.model('Comment').schema;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  posts: {
    type: [PostSchema]
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
