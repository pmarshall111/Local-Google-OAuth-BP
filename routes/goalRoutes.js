const mongoose = require("mongoose");
const Users = mongoose.model("users");
const ImprovementArea = mongoose.model("improvement-areas");
const Targets = mongoose.model("targets");
const Time = mongoose.model("time");
const TargetCollection = mongoose.model("target-collections");

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
  ////////////////////////////
  //UNTESTED
  ///////////////////////////

  app.post("/area/new", requireLogIn, async (req, res) => {
    //Could be 4 steps instead if we first create target, then collection, then goal, then user.

    var { subject, targetCollections } = req.body;

    //validation can come on the client side as to whether the user already has an area with this name.
    //this is because we will call populate when sending the users details back

    try {
      var newTargets = await Promise.all([
        targetCollections.map(target => {
          var timePeriod = moment(0).days(target.timePeriod);
          var startDate = moment().startOf("day");
          var finishDate = moment()
            .startOf("day")
            .add(timePeriod, "days");
          var targetTime = moment(0).hour(target.targetTime);

          return Targets.create({
            startDate,
            finishDate,
            targetTime,
            user: req.user._id
          });
        })
      ]);

      var newTargetCollections = await Promise.all([
        targetCollections.map((target, idx) => {
          var { repeating, targetTime, timePeriod } = target;
          targetTime = moment(0).hour(targetTime);
          timePeriod = moment(0).days(timePeriod);

          var targets = [newTargets[idx]];
          var startDate = moment().startOf("day");

          return TargetCollection.create({
            repeating,
            targetTime,
            startDate,
            timePeriod,
            targets,
            user: req.user._id
          });
        })
      ]);

      var newGoal = await ImprovementArea.create({
        subject,
        user: req.user._id,
        targetCollections: [...newTargetCollections]
      });

      var updatedUser = await Users.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { improvementAreas: newArea._id } },
        { new: true }
      ).populate({
        path: "improvementAreas",
        populate: {
          path: "targetCollections",
          populate: { path: "targets", populate: { path: "timeSpent" } }
        }
      });

      //need to have a think about what is best to send back... possibly the newUser with populate so front end has all the data
      res.send(updatedUser);
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });

  //UNTESTED
  app.post("/area/remove", requireLogin, async (req, res) => {
    //each model has a pre-remove hook on it that will remove children

    //checking that area exists
    const goalId = req.body;
    const goals = req.user._id.improvementAreas;
    if (!goals.includes(goalId))
      return res.send({ error: "We could not find that goal" });

    await ImprovementArea.remove({ _id: goalId });
    req.user.improvementAreas = req.user.improvementAreas.filter(
      x => x._id != goalId
    );

    res.send(req.user);
  });
};
