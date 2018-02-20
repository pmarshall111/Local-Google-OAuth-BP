const assert = require("assert");
const request = require("supertest");
const agent = require("./goal_routes_test");
const mongoose = require("mongoose");
const moment = require("moment");
moment().format();

var createdGoal;
describe("target routes", () => {
  //create a target, update, remove

  it("can create a goal for us to later add a target to", done => {
    agent
      .post("/area/new")
      .send({
        subject: "testing our API",
        targets: [
          {
            timePeriod: 7,
            targetTime: 35
          }
        ]
      })
      .then(response => {
        createdGoal = response.body.improvementAreas[0];
        assert.equal(
          response.body.improvementAreas[0].subject,
          "testing our API"
        );
        done();
      });
  });

  var createdTarget;

  it("can add a target to an existing goal", done => {
    agent
      .post("/target/new")
      .send({
        goalId: createdGoal._id,
        target: {
          timePeriod: 1,
          targetTime: 10
        }
      })
      .then(response => {
        createdTarget = response.body.improvementAreas[0].targets[1];
        assert(response.body.improvementAreas[0].targets.length, 2);
        done();
      });
  });

  it("added the correct time period to db", done => {
    assert.equal(moment(createdTarget.timePeriod).dayOfYear(), 1);
    done();
  });

  it("added the correct target time to db", done => {
    var date = moment(createdTarget.targetTime);
    var hours = (date.dayOfYear() - 1) * 24 + date.hour();
    assert.equal(hours, 10);
    done();
  });

  it("added correct start date to db", done => {
    var date = moment(createdTarget.startDate);
    var now = moment().startOf("day");
    assert.equal(date.toString(), now.toString());
    done();
  });

  var updatedUser;

  it("can update a target", done => {
    agent
      .post("/target/update")
      .send({
        targetId: createdTarget._id,
        updates: {
          timePeriod: 1,
          targetTime: 10,
          fillAllWeeks: false
        }
      })
      .then(response => {
        updatedUser = response.body;
        assert.equal(
          response.body.improvementAreas[0].targets[1].fillAllWeeks,
          false
        );
        done();
      });
  });

  it("can remove a target", done => {
    agent
      .post("/target/remove")
      .send({
        targetId: createdTarget._id
      })
      .then(response => {
        assert.equal(response.body.improvementAreas[0].targets.length, 1);
        done();
      });
  });

  var Target = mongoose.model("targets");
  it("removes target from the Targets model", done => {
    Target.count({ _id: createdTarget._id }).then(count => {
      assert.equal(count, 0);
      done();
    });
  });
});

module.exports = agent;
