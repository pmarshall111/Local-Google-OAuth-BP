const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  googleID: String,
  tags: [String],
  improvementAreas: [{ type: Schema.Types.ObjectId, ref: "improvement-areas" }],
  days: [{ type: Schema.Types.ObjectId, ref: "days" }]
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

userSchema.pre("remove", async function(next) {
  var ImprovementArea = mongoose.model("improvement-areas");
  var Badges = mongoose.model("badges");
  var Days = mongoose.model("days");
  var areas = this.improvementAreas;
  if (areas.length > 0) {
    //cant call remove on the model as this doesnt trigger the pre-remove tags.
    //have to find the individual document first then call remove on it
    var [toGo, removingBadges] = await Promise.all([
      ImprovementArea.find({ _id: { $in: areas } }),
      Badges.update(
        { earnedBy: { $elemMatch: { user: this._id } } },
        { $pull: { earnedBy: { user: this._id } } },
        { multi: true }
      ),
      Days.remove({ user: this._id })
    ]);
    await Promise.all(toGo.map(x => x.remove()));
  }
  next();
});

const User = mongoose.model("users", userSchema);

module.exports = User;
