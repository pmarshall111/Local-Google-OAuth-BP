const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = new Schema({
  goal: { type: Schema.Types.ObjectId, ref: "improvement-areas" },
  timeStarted: Date,
  timeFinished: Date,
  sessions: [
    {
      timeStarted: Date,
      timeFinished: Date
    }
  ],
  tags: [String],
  mood: Number,
  user: { type: Schema.Types.ObjectId, ref: "users" },
  totalTime: Date
});

const Time = mongoose.model("time", timeSchema);

module.exports = Time;
