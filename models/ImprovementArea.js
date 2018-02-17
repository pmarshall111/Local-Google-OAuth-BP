const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const areaSchema = new Schema({
  subject: String,
  user: { type: Schema.Types.ObjectId, ref: "users" },
  targetCollections: [
    { type: Schema.Types.ObjectId, ref: "target-collections" }
  ]
});

areaSchema.pre("remove", async next => {
  var TargetCollection = mongoose.model("target-collections");
  var collections = this.targetCollections;
  await TargetCollection.remove({ _id: { $in: collections } });
  next();
});

const ImprovementAreas = mongoose.model("improvement-areas", areaSchema);

module.exports = ImprovementAreas;
