const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const Users = mongoose.model("users");

var LocalOptions = {
  usernameField: "email"
};

const localLogin = new LocalStrategy(LocalOptions, function(
  email,
  password,
  done
) {
  // console.log({ email, password });
  Users.findOne({ email }, function(err, user) {
    if (err) return done(err, false, { error: "Database lookup error" });
    if (!user)
      return done(null, false, {
        error: "Could not find a user with that email address"
      });

    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err, false, { error: "Password compare error" });
      if (!isMatch)
        return done(null, false, { error: "Password did not match" });

      return done(null, user);
    });
  });
});

const localSignup = new LocalStrategy(LocalOptions, function(
  email,
  password,
  done
) {
  // console.log(email, password);
  if (!email || !password)
    return done(null, false, { error: "Both email and password are required" });
  //check if user already exists with that email.
  Users.findOne({ email }, function(err, match) {
    //if database error
    if (err) return done(err, false, { error: "Database lookup error" });
    if (match) {
      return done(null, false, { error: "Email already in use" });
    }

    const user = new Users({ email, password });
    //user has a method on it that encrypts the password just before it gets saved.
    //this means we do not save the password to our database in plain text
    user.save(function(err) {
      if (err) return done(err, false, { error: "Database save error" });
      else {
        return done(null, user);
      }
    });
  });
});

passport.use("local-login", localLogin);
passport.use("local-signup", localSignup);
