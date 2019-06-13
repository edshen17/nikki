const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {

  
  passport.use(
    new LocalStrategy((username, password, done) => {
      // Find user
      User.findOne({
        username: username
      }).then(user => {
        if (!user) {
          console.log('no user')
          return done(null, false, { message: 'That user is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            console.log('good')
            return done(null, user);
          } else {
            console.log('wrong pass')
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
