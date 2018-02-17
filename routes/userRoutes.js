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
  app.get("/user/remove", requireLogIn, async (req, res) => {
    try {
      await Users.findOneAndRemove({ _id: req.user._id });

      res.send({ info: "Account removed!" });
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });

  app.get("/user/checkDuplicate", requireLogIn, async (req, res) => {
    var users = await Users.find({ email: req.user.email });
    if (users.length === 1) res.send({ duplicate: false });
    else if (users.length === 0)
      res.send({ error: "Could not find user with users email" });
    else res.send({ duplicate: true });
  });

  app.post("/user/update", requireLogIn, async (req, res) => {
    try {
      var updatedUser = await Users.findAndUpdate(
        { id: req.user._id },
        {
          ...req.body.updates
        },
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

  app.get("/user/merge", requireLogIn, async (req, res) => {
    //NOT COMPLETE

    var users = await Users.find({ email: req.user.email }).populate({
      path: "improvementAreas",
      populate: {
        path: "targetCollections",
        populate: { path: "targets", populate: { path: "timeSpent" } }
      }
    });

    var toRemove = [];

    for (let i = 1; i < users.length; i++) {
      var mainUserIAs = users[0].improvementAreas;
      for (let j = 0; i < users[i].improvementAreas.length; j++) {
        var index = mainUserIAs.findIndex(x => {
          return x.subject === users[i].improvementAreas[j].subject;
        });
        if (index === -1) {
          mainUserIAs.push(users[i].improvementAreas[j]);
        } else {
          //if we have duplicates, we need to check if target collections are duplicates.

          //get the time associated with that branch and add it to main user branch;
          var uIA = users[i].improvementAreas[j];
          for (let a = 0; a < uIA.length; a++) {
            var uIATargetCol = uIA[a];
            var tcIndex = mainUserIAs[index].findIndex(x => {
              let { timePeriod, targetTime } = uIATargetCol;
              return x.timePeriod === timePeriod && x.targetTime === targetTime;
            });

            if (tcIndex !== -1) {
              //we have duplicate target collection;
              //need to go through and either assign time to current targets or create new ones within the current targets.
            }
          }

          //switch over any target collections
        }
      }
    }
  });
};
