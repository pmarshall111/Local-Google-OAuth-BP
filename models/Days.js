const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const daysSchema = new Schema({
  day: Date,
  time: [{ type: Schema.Types.ObjectId, ref: "time" }]
});

const Days = mongoose.model("days", daysSchema);

module.exports = Days;
