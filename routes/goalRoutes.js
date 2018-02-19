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

//could possibly have a merge goals route as well. possibly unneeded???

module.exports = app => {
  ////////////////////////////
  //UNTESTED
  ///////////////////////////

  app.post("/area/new", requireLogIn, async (req, res) => {
    var { subject, targets } = req.body;

    //create targets. create goal and link target before save. add goal to user and send back user.

    try {
      var newTargets = await Promise.all(
        targets.map(target => {
          var timePeriod = moment(0).days(target.timePeriod);
          var startDate = moment().startOf("day");
          var targetTime = moment(0).hour(target.targetTime);

          return Targets.create({
            startDate,
            timePeriod,
            targetTime,
            user: req.user._id
          });
        })
      );

      var newGoal = await ImprovementArea.create({
        subject,
        user: req.user._id,
        targets: [...newTargets]
      });

      var updatedUser = await Users.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { improvementAreas: newGoal._id } },
        { new: true }
      ).populate({
        path: "improvementAreas",
        populate: {
          path: "targetCollections",
          populate: { path: "targets", populate: { path: "timeSpent" } }
        }
      });

      res.send(updatedUser);
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });

  //UNTESTED
  app.post("/area/remove", requireLogIn, async (req, res) => {
    //each model has a pre-remove hook on it that will remove children

    //checking that area belongs to user
    const goalId = req.body;
    const goals = req.user._id.improvementAreas;
    if (!goals.includes(goalId))
      return res.send({ error: "We could not find that goal" });

    try {
      var success = await ImprovementArea.remove({ _id: goalId });

      if (success) {
        req.user.improvementAreas = req.user.improvementAreas.filter(
          x => x._id != goalId
        );
        res.send(req.user);
      }
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });
};
