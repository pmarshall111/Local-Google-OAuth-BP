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
  app.post("/time/new", requireLogIn, async (req, res) => {
    //we need the goal id that we can use to get active targets to add the time to

    //currently not a valid ObjectId
    const { goalId } = req.body;

    //find goal, and populate targets that have a finishDate in the future

    var currentGoals = await ImprovementArea.findById(goalId).populate({
      path: "targets",
      match: { finishDate: { $gt: new Date(Date.now()) } },
      select: "_id"
    });

    if (currentGoals.user.toString() != req.user._id)
      return res.send({ error: "You can only add time to your own goals" });

    //if no current targets, we need to call a route that can refresh targets
    //Would be cool if we calculated when the finish time was and added any time before then to previous route
    if (currentGoals.targets.length === 0)
      return res.send({ todo: "Need to add updating target route" });

    const { timeStarted, timeFinished, tags } = req.body.time;
    var newTime = await Time.create({
      timeStarted,
      timeFinished,
      tags,
      user: req.user._id
    });

    var targetsToUpdate = await Promise.all(
      currentGoals.targets.map(target => Targets.findById(target))
    );

    targetsToUpdate.forEach(target => target.timeSpent.push(newTime._id));

    var updatedTargets = Promise.all(targetsToUpdate.map(x => x.save()));

    res.send({ updatedTargets: targetsToUpdate });
  });
};
