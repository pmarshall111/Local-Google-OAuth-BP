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
  app.post("/collections/create", requireLogIn, async (req, res) => {
    //first create new target, then create new target collection with target in.
    //then update user and send back user.

    const { targetCollection, goalId } = req.body;

    //checking that goal exists
    const goals = req.user._id.improvementAreas;
    if (!goals.includes(goalId))
      return res.send({ error: "We could not find a goal to connect to" });

    var { repeating, timePeriod, targetTime } = targetCollection;
    var timePeriod = moment(0).days(timePeriod);
    var startDate = moment().startOf("day");
    var finishDate = moment()
      .startOf("day")
      .add(timePeriod, "days");
    var targetTime = moment(0).hour(targetTime);

    try {
      var newTarget = await Targets.create({
        startDate,
        finishDate,
        targetTime,
        user: req.user._id
      });

      var newCollection = await TargetCollection.create({
        repeating,
        startDate,
        targetTime,
        timePeriod,
        targets: [newTarget._id],
        user: req.user._id
      });

      var updatedArea = await ImprovementArea.findOneAndUpdate(
        { _id: goalId },
        { $push: { targetCollections: newCollection._id } },
        { new: true }
      );

      req.user.improvementAreas[goalId].targetCollections.push(newCollection);
      res.send({ user: req.user });
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });

  //UNTESTED
  app.post("/collections/toggleActive", requireLogIn, async (req, res) => {
    //want to be sending along the ID of the collection we want to toggle.

    const collection = req.body.collectionId;

    //need to add in verification step so that a user can only toggle their own area
    const usersCollections = req.user._id.improvementAreas.targetCollections;
    if (!usersCollections.includes(collection))
      return res.send({ error: "You can only edit your own areas" });

    //need this duplicate step so that we can set active to the opposite
    var selectedArea = await TargetCollection.findById(collection);
    var updated = await TargetCollection.findOneAndUpdate(
      { _id: collection },
      { active: !selectedArea.active },
      { new: true }
    );
    res.send(updated);
  });

  //UNTESTED
  app.post("/collections/toggleRenews", requireLogIn, async (req, res) => {
    //want to be sending along the ID of the collection we want to toggle.

    const collection = req.body.collectionId;

    //need to add in verification step so that a user can only toggle their own area
    const usersCollections = req.user._id.improvementAreas.targetCollections;
    if (!usersCollections.includes(collection))
      return res.send({ error: "You can only edit your own areas" });

    //need this duplicate step so that we can set active to the opposite
    var selectedArea = await TargetCollection.findById(collection);
    var updated = await TargetCollection.findOneAndUpdate(
      { _id: collection },
      { targetsOnlyOnLoginPeriods: !selectedArea.targetsOnlyOnLoginPeriods },
      { new: true }
    );
    res.send(updated);
  });
};
