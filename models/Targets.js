const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = require("./Time");

const targetSchema = new Schema({
  startDate: Date,
  finishDate: Date,
  targetTime: Date,
  timeSpent: [{ type: Schema.Types.ObjectId, ref: "time" }],
  user: { type: Schema.Types.ObjectId, ref: "users" }
});

//we don't remove time in here as it may apply to other targetcollections

const Targets = mongoose.model("targets", targetSchema);

module.exports = Targets;
