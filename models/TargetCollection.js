const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const targetCollectionSchema = new Schema({
  startDate: Date,
  timePeriod: Number,
  targetTime: Date,
  active: { type: Boolean, default: true },
  repeating: Boolean,
  targetsOnlyOnLoginPeriods: { type: Boolean, default: false },
  targets: [{ type: Schema.Types.ObjectId, ref: "targets" }],
  user: { type: Schema.Types.ObjectId, ref: "users" }
});

targetCollectionSchema.pre("remove", async next => {
  var Targets = mongoose.model("targets");
  var targets = this.targets;
  await Targets.remove({ _id: { $in: targets } });
  next();
});

const TargetCollection = mongoose.model(
  "target-collections",
  targetCollectionSchema
);

module.exports = TargetCollection;
