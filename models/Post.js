'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/User');

const CommentSchema = new Schema({
  postedBy: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {type: Date, default: Date.now},
  editedAt: {type: Date, default: Date.now},
  likedBy: [String]
});

// Edit a schema
CommentSchema.method('edit', function(edits, callback) {
  Object.assign(this, edits, {editedAt: new Date()});
  this.parent().save(callback);
});

const PostSchema = new Schema({
  postedBy: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {type: Date, default: Date.now},
  likedBy: [String]
});

// PostSchema.pre('save', function(next) {
//   this.comments.sort(sortComments;
//   next();
// });

const Comment = mongoose.model('Comment', CommentSchema);
const Post = mongoose.model('Post', PostSchema);

module.exports.Comment = Comment;
module.exports.Post = Post;
