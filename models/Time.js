const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSchema = new Schema({
  timeStarted: Date,
  timeFinished: Date,
  tags: [String],
  goal: {}
});
