module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'You have to be logged in to view this page.')
    res.redirect('/users/login');
  }
}
