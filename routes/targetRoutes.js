const mongoose = require("mongoose");
const Users = mongoose.model("users");
const ImprovementArea = mongoose.model("improvement-areas");
const Targets = mongoose.model("targets");
const Time = mongoose.model("time");

function requireLogIn(req, res, next) {
  if (!req.user)
    return res.send({
      error: "User must be logged in"
    });
  next();
}

module.exports = app => {
  app.post("/target/toggleRepeat", requireLogIn, async (req, res) => {
    //we want to send along the id of the target we wish to toggle;

    const { targetId } = req.body;
    try {
      //authorization step;
      var usersTargets = await Targets.find({ user: req.user._id });
      var target = usersTargets.filter(x => x._id == targetId);
      if (target.length === 0)
        return res.send({ error: "You can only edit your own targets" });

      var updated = await Targets.findOneAndUpdate(
        { _id: targetId },
        { repeating: !target[0].repeating },
        { new: true }
      );
      res.send(updated);
    } catch (e) {
      console.log("targetRoute", e);
      res.send({ error: "Database error" });
    }
  });

  app.post("/target/new", requireLogIn, async (req, res) => {
    const { repeating, targetTime, finishDate, period } = req.body.target;
    try {
      //need validation to ensure that areaId is an area on the user???
      var userGoal = await ImprovementArea.findById(req.body.areaId);
      if (userGoal.user.toString() != req.user._id)
        return res.send({
          error: "You can only add targets to your own Improvement areas"
        });

      var target = await Targets.create({
        repeating,
        targetTime,
        finishDate,
        period,
        improvementArea: req.body.areaId,
        user: req.user._id
      });

      userGoal.targets.push(target._id);
      var updatedGoal = await userGoal.save();

      res.send(updatedGoal);
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });
};
