const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  //because in mLab the generated ID is stored under _id.$OId, we can use user.id as a shortcut
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }).then(user => {
    //so that we don't send back the user password, even though it's encrypted
    var result = { _id: user._id, email: user.email };
    done(null, result);
  });
});
