const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = require("./Time");

const targetSchema = new Schema({
  startDate: Date,
  targetTime: Date,
  timePeriod: Date,
  user: { type: Schema.Types.ObjectId, ref: "users" },
  fillAllWeeks: { type: Boolean, default: true }
});

const Targets = mongoose.model("targets", targetSchema);

module.exports = Targets;
