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
  app.get("/user/remove", requireLogIn, async (req, res) => {
    try {
      await Users.findOneAndRemove({ _id: req.user._id });

      res.send({ info: "Account removed!" });
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
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

  app.get("/user/checkDuplicate", requireLogIn, async (req, res) => {
    var users = await Users.find({ email: req.user.email });
    if (users.length === 1) res.send({ duplicate: false });
    else if (users.length === 0)
      res.send({ error: "Could not find user with users email" });
    else res.send({ duplicate: true });
  });

  app.get("/user/merge", requireLogIn, async (req, res) => {
    //NOT COMPLETE
    try {
      //STEP 1: get users with same email
      var users = await Users.find({ email: req.user.email }).populate({
        path: "improvementAreas",
        populate: {
          path: "targets time"
        }
      });

      var mainUser = users[0];

      //loop just incase we have more than 2 users
      for (let i = 1; i < users.length; i++) {
        //loop to go through the goals list for each user.
        for (let j = 0; j < users[i].improvementAreas; j++) {
          //STEP 2: check if goals match
          var dupGoalIndex = mainUser.improvementAreas.findIndex(
            x => x.subject === users[i].improvementAreas[j].subject
          );
          if (dupGoalIndex === -1) {
            //if no duplicate, just copy over whole improvement area.
            mainUser.improvementAreas.push(users[i].improvementAreas[j]);
          } else {
            //improvement areas have the same name. we can copy over all time entries
            //and the unique targets
            mainUser.improvementAreas[index].time = [
              ...mainUser.improvementAreas[index].time,
              ...users[i].improvementAreas[j].time
            ];
            for (let k = 0; k < users[i].improvementAreas[j].targets; k++) {
              var dupTargetIndex = mainUser.improvementAreas[index].findIndex(
                x => {
                  return (
                    x.targetTime ===
                      users[i].improvementAreas[j].targets[k].targetTime &&
                    x.timePeriod ===
                      users[i].improvementAreas[j].targets[k].timePeriod
                  );
                }
              );

              if (dupTargetIndex === -1) {
                //if target is unique, add target to main user;
                mainUser.improvementAreas[index].targets.push(
                  users[i].improvementAreas[j].targets[k]
                );
              }
            }
          }
        }
        //step so that any unique properties on other accounts such as googleID
        //will be passed over to main account. duplicate properties will be overwritten
        mainUser = { ...users[i], mainUser };
      }

      //STEP 3: change user property on all secondary users items to new user
      //and save main user.

      var secondaryUserIds = users.slice(1).map(x => x._id);

      var updates = await Promise.all([
        mainUser.save(),
        ImprovementArea.update(
          { user: { $in: secondaryUserIds } },
          { user: users[0]._id }
        ),
        Targets.update(
          { user: { $in: secondaryUserIds } },
          { user: users[0]._id }
        ),
        Time.update({ user: { $in: secondaryUserIds } }, { user: users[0]._id })
      ]);

      if (updates) res.send(updates[0]);
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });
};
