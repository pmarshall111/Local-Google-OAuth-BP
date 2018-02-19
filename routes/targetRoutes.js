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
    var goalWithTarget = usersGoals.filter(x => x.targets.includes(targetId));
    if (goalWithTarget.length === 0)
      return res.send({ error: "Could not find this target on your user" });

    try {
      var updated = await Targets.findOneAndUpdate(
        { _id: targetId },
        { ...updates },
        { new: true }
      );

      res.send(updated);
      //will have to do some magic on client side to alter user state
    } catch (e) {
      console.log("targetRoute", e);
      res.send({ error: "Database error" });
    }
  });

  app.post("/target/new", requireLogIn, async (req, res) => {
    const { goalId, target } = req.body;
    var { targetTime, startDate, timePeriod } = target;
    try {
      //need validation to ensure that areaId is an area on the user???
      var userGoal = await ImprovementArea.findById(goalId);
      if (userGoal.user.toString() != req.user._id)
        return res.send({
          error: "You can only add targets to your own Improvement areas"
        });

      timePeriod = moment(0).days(timePeriod);
      startDate = moment().startOf("day");
      targetTime = moment(0).hour(targetTime);

      var newTarget = await Targets.create({
        targetTime,
        startDate,
        timePeriod,
        user: req.user._id
      });

      userGoal.targets.push(newTarget._id);
      var updatedGoal = await userGoal.save();

      //again will need magic on user end to update user.
      res.send(updatedGoal);
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });

  app.post("/target/remove", async (req, res) => {
    var { targetId } = req.body;

    //verification
    var usersGoals = req.user.improvementAreas;
    var goalWithTarget = usersGoals.filter(x => x.targets.includes(targetId));
    if (goalWithTarget.length === 0)
      return res.send({ error: "Could not find this target on your user" });

    try {
      var success = await Promise.all([
        ImprovementAreas.findOneAndUpdate(
          { _id: goalWithTarget._id },
          { $pull: { targets: targetId } }
        ),
        Targets.findOneAndRemove({ _id: targetId })
      ]);

      if (success) {
        console.log(success);
        res.send(success[0]);
      }
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });
};
