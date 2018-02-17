const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = new Schema({
  timeStarted: Date,
  timeFinished: Date,
  tags: [String],
  mood: Number,
  user: { type: Schema.Types.ObjectId, ref: "users" }
});

const Time = mongoose.model("time", timeSchema);

module.exports = Time;
