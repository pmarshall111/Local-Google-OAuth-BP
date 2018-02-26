function requireLogIn(req, res, next) {
  if (!req.user)
    return res.send({
      error: "User must be logged in"
    });
  next();
}

module.exports = requireLogIn;
