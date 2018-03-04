const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var badgesSchema = new Schema({
  title: String,
  points: Number,
  earnedBy: [
    {
      user: { type: Schema.Types.ObjectId, ref: "users" },
      times: { type: Number, default: 0 },
      lastEarned: Date
    }
  ],
  description: String,
  target: Number,
  category: String
});

var Badges = mongoose.model("badges", badgesSchema);

module.exports = Badges;
