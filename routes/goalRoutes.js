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
  app.post("/area/new", requireLogIn, async (req, res) => {
    var { subject, targets } = req.body;

    //validation can come on the client side as to whether the user already has an area with this name.
    //this is because we will call populate when sending the users details back
    try {
      var newArea = await ImprovementArea.create({
        subject,
        user: req.user._id
      });

      targets = targets.map(target => {
        const { repeating, targetTime, period, finishDate } = target;
        return {
          insertOne: {
            document: {
              repeating,
              targetTime,
              finishDate,
              period,
              improvementArea: newArea._id,
              user: req.user._id
            }
          }
        };
      });

      var [newTargets, updatedUser] = await Promise.all([
        Targets.bulkWrite(targets),
        Users.findOneAndUpdate(
          { _id: req.user._id },
          { $push: { improvementAreas: newArea._id } },
          { new: true }
        )
      ]);

      Object.values(newTargets.insertedIds).forEach(id =>
        newArea.targets.push(id)
      );

      var savedTargets = await newArea.save();
      //need to have a think about what is best to send back... possibly the newUser with populate so front end has all the data
      res.send(updatedUser);
    } catch (e) {
      console.log(e);
      res.send({ error: "Database error" });
    }
  });

  app.post("/area/toggleActive", requireLogIn, async (req, res) => {
    //want to be sending along the ID of the area we want to toggle.

    const area = req.body.areaId;

    //need to add in verification step so that a user can only toggle their own area
    const usersAreas = req.user._id.improvementAreas;
    if (!usersAreas.includes(area))
      return res.send({ error: "You can only edit your own areas" });

    var selectedArea = await ImprovementArea.findById(area);
    var updated = await ImprovementArea.findOneAndUpdate(
      { _id: area },
      { active: !selectedArea.active },
      { new: true }
    );
    res.send(updated);
  });
};
