const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  googleID: String,
  improvementAreas: [{ type: Schema.Types.ObjectId, ref: "improvement-areas" }]
});

//encrypting the password before it's saved to the database.
userSchema.pre("save", function(next) {
  //this step is needed if we use normal functions, as the value of "this"
  //when inside the bcrpyt function changes to bcrypt. However, if we use
  //arrow functions then the value of this is preserved
  const user = this;

  //if signed in with google, they don't need a password, so we skip
  if (user.googleID) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(attempt, callback) {
  bcrypt.compare(attempt, this.password, function(err, res) {
    if (err) return callback(err);

    return callback(null, res);
  });
};

const User = mongoose.model("users", userSchema);

module.exports = User;
