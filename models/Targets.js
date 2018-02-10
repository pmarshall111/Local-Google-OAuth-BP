const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = require("./Time");

const targetSchema = new Schema({
  repeating: Boolean,
  period: Number,
  finishDate: Date,
  targetTime: Date,
  improvementArea: { type: Schema.Types.ObjectId, ref: "improvement-areas" },
  timeSpent: [{ type: Schema.Types.ObjectId, ref: "time" }],
  completed: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: "users" }
});

const Targets = mongoose.model("targets", targetSchema);

module.exports = Targets;
