const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var badgesSchema = new Schema({
  title: String,
  points: Number,
  earnedBy: [
    {
      user: { type: Schema.Types.ObjectId, ref: "users" },
      times: { type: Number, default: 0 }
    }
  ]
});

var Badges = mongoose.model("badges", badgesSchema);

module.exports = Badges;
