const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  //because in mLab the generated ID is stored under _id.$OId, we can use user.id as a shortcut
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    var user = User.findOne({ _id: id }).populate({
      path: "improvementAreas",
      populate: {
        path: "targets time"
      }
    });

    user.password = null;
    done(null, user);
  } catch (e) {
    done(e);
  }
});
