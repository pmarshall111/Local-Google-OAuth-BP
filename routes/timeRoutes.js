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
        var totalHours = sessions.reduce((t, c) => {
          var diff = moment(c.timeFinished).diff(
            moment(c.timeStarted),
            "hours",
            true
          );
          // console.log({ diff });
          t += diff;
          return t;
        }, 0);
        return Time.create({
          goal: goalId,
          timeStarted,
          timeFinished,
          sessions,
          mood,
          tags,
          totalHours,
          user: req.user._id
        });
      })
    );

    //plan is to store a time for each of the goalIds on the day to make calculation server side quicker
    var goal = goalId.toString();
    var subject = `totalHours.${oneGoal[0].subject}`;
    //strict is required in options as otherwise mongoose won't let you add fields not in Schema
    var newDates = await Promise.all(
      newTimes.map(x => {
        if (!x.goal) console.log({ x, body: req.body });
        return Days.findOneAndUpdate(
          { day: moment(x.timeStarted).startOf("day"), user: req.user._id },
          { $push: { time: x }, $inc: { [subject]: x.totalHours.toFixed(1) } },
          {
            upsert: true,
            new: true,
            strict: false
          }
        );
      })
    );

    //we don't populate individual times as we have already calculated the total hours for each area.
    //if we want individual data for the day and week, we can make an ajax request for those times.
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

  //needs testing
  app.get("/time/detailed", requireLogIn, async (req, res) => {
    var times = await Time.find({
      user: req.user._id
    })
      .populate({ path: "goal", select: "subject" })
      .sort({ timeStarted: 1 });

    res.send({ times });
  });
};
