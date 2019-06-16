'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/User');

// sorts comments by most number of likes
// const sortComments = function(a, b) {
//   if (a.votes === b.votes) {
//       return b.updatedAt - a.updatedAt;
//   }
//
//   return b.votes - a.votes;
// }

const CommentSchema = new Schema({
  text: String,
  createdAt: {type: Date, default: Date.now},
  editedAt: {type: Date, default: Date.now},
  likedBy: [User]

});

// Edit a schema
CommentSchema.method('edit', function(edits, callback) {
  Object.assign(this, edits, {editedAt: new Date()});
  this.parent().save(callback);
});

const PostSchema = new Schema({
  postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  text: String,
  createdAt: {type: Date, default: Date.now},
  comments: [CommentSchema],
  likedBy: [User]
});

// PostSchema.pre('save', function(next) {
//   this.comments.sort(sortComments;
//   next();
// });

const Comment = mongoose.model('Comment', CommentSchema);
const Post = mongoose.model('Post', PostSchema);

module.exports.Comment = Comment;
module.exports.Post = Post;
