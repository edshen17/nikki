'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  editedAt: {type: Date, default: Date.now}
  // likes should link users in an array

});

CommentSchema.method('edit', function(edits, callback) {
  Object.assign(this, edits, {editedAt: new Date()});
  this.parent().save(callback);
});

const PostSchema = new Schema({
  text: String,
  createdAt: {type: Date, default: Date.now},
  comments: [CommentSchema]
  // likes should link users in an array
});

// PostSchema.pre('save', function(next) {
//   this.comments.sort(sortComments;
//   next();
// });

const Comment = mongoose.model('Comment', CommentSchema);
const Post = mongoose.model('Post', PostSchema);

module.exports.Comment = Comment;
module.exports.Post = Post;
