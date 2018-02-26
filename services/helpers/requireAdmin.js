const administrators = require("../../config/keys").indexInfo.admin;

function requireAdmin(req, res, next) {
  if (!administrators.includes(req.user.email))
    return res.send({
      error: "Only admins have permission to do that"
    });
  next();
}

module.exports = requireAdmin;
