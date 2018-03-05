const mongoose = require("mongoose");
const Users = mongoose.model("users");
const ImprovementArea = mongoose.model("improvement-areas");
const Targets = mongoose.model("targets");
const Days = mongoose.model("days");
const Time = mongoose.model("time");
const moment = require("moment");

const requireLogIn = require("../services/helpers/requireLogIn");

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
        var totalTime = sessions.reduce((t, c) => {
          var diff = moment(c.timeFinished).diff(
            moment(c.timeStarted),
            "hours",
            true
          );
          t.add(diff, "hours");
          return t;
        }, moment(0));
        return Time.create({
          timeStarted,
          timeFinished,
          sessions,
          mood,
          tags,
          totalTime
        });
      })
    );

    var newDates = await Promise.all(
      newTimes.map(x => {
        return Days.findOneAndUpdate(
          { day: moment(x.timeStarted).startOf("day") },
          { $push: { time: x } },
          {
            upsert: true,
            new: true
          }
        );
      })
    );

    // console.log({ newTimes, newDates });

    var updatedUser = await Users.findOneAndUpdate(
      { _id: req.user._id },
      { $addToSet: { tags: { $each: tags }, days: { $each: newDates } } },
      { new: true }
    )
      .populate({
        path: "improvementAreas",
        populate: {
          path: "targets"
        }
      })
      .populate({
        path: "days",
        populate: {
          path: "time"
        },
        options: { sort: { day: 1 } }
      });

    updatedUser.password = null;

    //now we have added time, check if we unlocked badges

    res.send(updatedUser);
    // req.user.improvementAreas = req.user.improvementAreas.map(x => {
    //   if (x._id.toString() == updatedGoal._id.toString()) return updatedGoal;
    //   return x;
    // });

    // res.send(req.user);
  });
};
