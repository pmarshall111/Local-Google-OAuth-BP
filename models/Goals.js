const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const goalsSchema = new Schema({
  finishDate: Date,
  targetTime: Date,
  currentTime: Date,
  subject: String,
  repeating: { type: Boolean, default: true },
  timesCompleted: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  period: String
});

const Goals = mongoose.model("goals");

module.exports = Goals;
