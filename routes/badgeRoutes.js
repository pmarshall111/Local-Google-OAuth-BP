const mongoose = require("mongoose");
const Users = mongoose.model("users");
const Badges = mongoose.model("badges");

const requireLogIn = require("../services/helpers/requireLogIn");
const requireAdmin = require("../services/helpers/requireAdmin");

module.exports = app => {
  app.get("/badges", requireLogIn, async (req, res) => {
    var [totalUsers, allBadges] = await Promise.all([
      Users.count(),
      Badges.find()
    ]);
    var userBadges = allBadges.map(x => {
      var { title, points, _id } = x;

      if (!x.earnedBy) x.earnedBy = [];
      var totalUsersCompleted = x.earnedBy.length,
        percentageUnlocked = totalUsersCompleted / totalUsers * 100;

      var toReturn = {
        _id,
        title,
        points,
        percentageUnlocked,
        userCompletions: 0
      };

      var userEntry = x.earnedBy.filter(y => {
        return y.user.toString() == req.user._id.toString();
      });

      if (userEntry.length) {
        toReturn.userCompletions = userEntry[0].times;
      }

      return toReturn;
    });

    res.send(userBadges);
  });

  app.post("/badges/new", requireAdmin, async (req, res) => {
    const { title, points } = req.body;
    var newBadge = await Badges.create({
      title,
      points,
      earnedBy: []
    });

    res.send(newBadge);
  });

  app.post("/badges/unlock", requireLogIn, async (req, res) => {
    const { badgeId } = req.body;
    var unlockedBadge = await Badges.findById(badgeId);

    // if (unlockedBadge.earnedBy) {
    var usersEntry = unlockedBadge.earnedBy.filter(
      x => x.user.toString() == req.user._id.toString()
    );
    if (usersEntry.length === 0) {
      unlockedBadge.earnedBy.push({
        user: req.user._id,
        times: 1
      });
    } else {
      usersEntry[0].times++;
    }
    // } else {
    //   unlockedBadge.earnedBy = [
    //     {
    //       user: req.user._id,
    //       times: 1
    //     }
    //   ];
    // }
    // console.dir(unlockedBadge);
    var updatedBadge = await unlockedBadge.save();

    res.send(updatedBadge);
  });
};
