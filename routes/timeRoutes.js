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
    const { goalId, time } = req.body;

    //validation
    const oneGoal = req.user.improvementAreas.filter(
      x => x._id.toString() == goalId.toString()
    );

    if (oneGoal.length === 0)
      return res.send({ error: "We could not find that goal" });

    //create time, then add it to goal. then send back edited user.
    var { mood, tags } = time[0];

    var newTimes = await Promise.all(
      time.map(x => {
        var { timeStarted, timeFinished, sessions } = x;
        return Time.create({
          timeStarted,
          timeFinished,
          sessions,
          mood,
          tags
        });
      })
    );

    console.log(newTimes);

    const updatedGoal = await ImprovementArea.findOneAndUpdate(
      { _id: oneGoal[0]._id },
      { $addToSet: { time: { $each: newTimes } } },
      { new: true }
    );

    console.log(updatedGoal);

    var updatedUser = await Users.findOneAndUpdate(
      { _id: req.user._id },
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    ).populate({
      path: "improvementAreas",
      populate: {
        path: "targets time"
      }
    });

    updatedUser.password = null;

    console.log(updatedUser);
    console.log(
      updatedUser.improvementAreas[updatedUser.improvementAreas.length - 1]
    );
    res.send(updatedUser);
    // req.user.improvementAreas = req.user.improvementAreas.map(x => {
    //   if (x._id.toString() == updatedGoal._id.toString()) return updatedGoal;
    //   return x;
    // });

    // res.send(req.user);
  });
};
