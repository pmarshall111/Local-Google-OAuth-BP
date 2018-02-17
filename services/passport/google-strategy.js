const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googleKeys = require("../../config/keys").googleInfo;
const mongoose = require("mongoose");
const User = mongoose.model("users");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleKeys.client_id,
      clientSecret: googleKeys.client_secret,
      callbackURL: "/auth/google/callback",
      proxy: true
      //the proxy setting is there to fix an error regarding the google redirect going to http
      //rather than https. This happens by default because the GoogleStrategy fills out the
      //relative callbackURL with http because if the traffic goes through a proxy, it automatically
      //assumes it is not secure anymore. The traffic has to go through the heroku proxy to get to
      //the correct port as there are thousands of ports running at the same time on heroku's server.
      //if we add in the key-value pair of proxy: true, we are saying that we trust the proxy's
      //the traffic is going through and to keep it https.
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile, "profule");
      var match = await User.findOne({ googleID: profile.id });
      if (match) return done(null, match);

      var user = await User.create({
        googleID: profile.id,
        email: profile.emails[0].value,
        name: profile.name.givenName
      });
      console.log(user, "user");
      done(null, user);
    }
  )
);
