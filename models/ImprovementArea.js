const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const areaSchema = new Schema({
  subject: String,
  startDate: Date,
  user: { type: Schema.Types.ObjectId, ref: "users" },
  targets: [{ type: Schema.Types.ObjectId, ref: "targets" }],
  time: [
    {
      type: Schema.Types.ObjectId
    }
  ]
});

areaSchema.pre("remove", async function(next) {
  var Targets = mongoose.model("targets");
  var Time = mongoose.model("time");
  var User = mongoose.model("users");
  var myTargets = this.targets,
    myTime = this.time,
    myUser = this.user;
  var result = await Promise.all([
    User.findOneAndUpdate(
      { _id: myUser },
      { $pull: { improvementAreas: this._id } },
      { new: true }
    ),
    Targets.remove({ _id: { $in: myTargets } }),
    Time.remove({ _id: { $in: myTime } })
  ]);
  next();
});

const ImprovementAreas = mongoose.model("improvement-areas", areaSchema);

module.exports = ImprovementAreas;
