require("../services/passport/passport");
require("../services/passport/google-strategy");
require("../services/passport/local-strategy");
const passport = require("passport");

//need to add in a way to merge accounts if someone wants to login with both google and user/pass

//this function takes our app object and attaches these routes to it
module.exports = function(app) {
  if (process.env.NODE_ENV !== "production") {
    app.get("/", (req, res) => {
      res.send({ message: "howdy", user: req.user });
    });
  }

  app.get("/current-user", (req, res) => {
    console.log(req.user);
    if (req.user) return res.send({ user: req.user });
    res.send({ error: "User not currently logged in" });
  });

  app.get("/logout", (req, res) => {
    console.log("in logout");
    //this is a function added by passport to the req object
    req.logout();
    //prop added by cookie-session which we need to use to remove the cookie once we logout
    req.session = null;
    res.redirect("/");
  });

  //google oauth routes
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/");
    }
  );

  //local routes. Added in callback function so we can deal with errors from authentication.
  //http://www.passportjs.org/docs/authenticate/ at the bottom
  app.post("/auth/login", function(req, res, next) {
    passport.authenticate("local-login", (err, user, info) => {
      console.log(err, user, info);
      if (info) res.send(info);
      else {
        req.login(user, err => {
          if (err) res.send({ error: "Login error" });
          return res.redirect("/");
        });
      }
    })(req, res, next);
  });

  app.post("/auth/signup", function(req, res, next) {
    passport.authenticate("local-signup", (err, user, info) => {
      console.log(err, user, info, "from authRoutes");
      if (info) res.send(info);
      else {
        req.login(user, err => {
          if (err) res.send({ error: "Login error" });
          return res.redirect("/");
        });
      }
    })(req, res, next);
  });
};
