const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const cookieKey = require("./config/keys").cookieKey;
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const goalRoutes = require("./routes/goalRoutes");
const targetRoutes = require("./routes/targetRoutes");
const timeRoutes = require("./routes/timeRoutes");
const userRoutes = require("./routes/userRoutes");
const badgeRoutes = require("./routes/badgeRoutes");

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

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
userRoutes(app);
badgeRoutes(app);

app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});

module.exports = app;
