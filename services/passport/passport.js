const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  //because in mLab the generated ID is stored under _id.$OId, we can use user.id as a shortcut
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    var user = await User.findOne({ _id: id })
      .populate({
        path: "days",
        populate: {
          path: "time"
        },
        options: { sort: { day: 1 } }
      })
      .populate({
        path: "improvementAreas",
        populate: {
          path: "targets"
        }
      });

    user.password = null;
    done(null, user);
  } catch (e) {
    done(e);
  }
});
