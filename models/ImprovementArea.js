const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const targetSchema = require("./Targets");

const areaSchema = new Schema({
  subject: String,
  user: { type: Schema.Types.ObjectId, ref: "users" },
  targets: [{ type: Schema.Types.ObjectId, ref: "targets" }],
  active: { type: Boolean, default: true }
});

const ImprovementAreas = mongoose.model("improvement-areas", areaSchema);

module.exports = ImprovementAreas;
