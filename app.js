const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const cookieKey = require("./config/keys").cookieKey;

const authRoutes = require("./routes/authRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const goalRoutes = require("./routes/goalRoutes");
const targetRoutes = require("./routes/targetRoutes");
const timeRoutes = require("./routes/timeRoutes");

//setting up cookies
//cookie session takes the data out of the cookie and assigns it to req.session
//passport then gets the id from req.session and finds the user with the deserializeUser function
app.use(
  cookieSession({
    keys: [cookieKey],
    maxAge: 7 * 60 * 60 * 1000
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
authRoutes(app);
quoteRoutes(app);
goalRoutes(app);
targetRoutes(app);
timeRoutes(app);

module.exports = app;
