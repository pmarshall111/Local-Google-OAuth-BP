const mongoose = require("mongoose");
const Users = mongoose.model("users");
const ImprovementArea = mongoose.model("improvement-areas");
const Targets = mongoose.model("targets");
const Time = mongoose.model("time");

const moment = require("moment");
moment().format();

function requireLogIn(req, res, next) {
  if (!req.user)
    return res.send({
      error: "User must be logged in"
    });
  next();
}

module.exports = app => {
  app.post("/target/update", requireLogIn, async (req, res) => {
    //we want to send along the id of the target we wish to toggle;

    const { targetId, updates } = req.body;

    //verification
    var usersGoals = req.user.improvementAreas;
    var goalWithTargetIdx = usersGoals.findIndex(x => {
      var there = false;
      var b = x.targets.map(x => {
        if (x._id.toString().includes(targetId.toString())) there = true;
      });
      return there;
    });
    if (goalWithTargetIdx === -1)
      return res.send({ error: "Could not find this target on your user" });

    try {
      var updated = await Targets.findOneAndUpdate(
        { _id: targetId },
        { ...updates },
        { new: true }
      );

      usersGoals[goalWithTargetIdx].targets = usersGoals[
        goalWithTargetIdx
      ].targets.map(x => {
        if (x._id.toString() == updated._id.toString()) {
          return updated;
        }
        return x;
      });

      res.send(req.user);
    } catch (e) {
      // console.log("targetRoute", e);
      res.send({ error: "Database error" });
    }
  });

  app.post("/target/new", requireLogIn, async (req, res) => {
    const { goalId, target } = req.body;
    var { targetTime, timePeriod } = target;
    try {
      //need validation to ensure that areaId is an area on the user???
      var userGoal = await ImprovementArea.findById(goalId).populate({
        path: "targets time"
      });
      if (userGoal.user.toString() != req.user._id)
        return res.send({
          error: "You can only add targets to your own Improvement areas"
        });

      var startDate = moment().startOf("day");

      timePeriod = moment(0).dayOfYear(timePeriod);
      targetTime = moment(0).hour(targetTime);

      var newTarget = await Targets.create({
        targetTime,
        startDate,
        timePeriod,
        user: req.user._id
      });

      userGoal.targets.push(newTarget);
      var updatedGoal = await userGoal.save();

      req.user.improvementAreas = req.user.improvementAreas.map(x => {
        if (x._id == goalId) {
          return updatedGoal;
        }
        return x;
      });

      res.send(req.user);
    } catch (e) {
      // console.log(e);
      res.send({ error: "Database error" });
    }
  });

  app.post("/target/remove", async (req, res) => {
    var { targetId } = req.body;

    //verification
    var usersGoals = req.user.improvementAreas;
    var goalWithTarget = usersGoals.filter(x =>
      x.targets.map(x => x._id.toString()).includes(targetId.toString())
    );
    if (goalWithTarget.length === 0)
      return res.send({ error: "Could not find this target on your user" });

    try {
      var updates = await Promise.all([
        ImprovementArea.findOneAndUpdate(
          { _id: goalWithTarget[0]._id },
          { $pull: { targets: targetId } },
          { new: true }
        ),
        Targets.findOneAndRemove({ _id: targetId })
      ]);

      req.user.improvementAreas = req.user.improvementAreas.map(x => {
        if (x._id.toString() == updates[0]._id.toString()) return updates[0];
        return x;
      });

      res.send(req.user);
    } catch (e) {
      // console.log(e);
      res.send({ error: "Database error" });
    }
  });
};
