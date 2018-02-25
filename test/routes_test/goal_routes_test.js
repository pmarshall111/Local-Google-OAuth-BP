const assert = require("assert");
const request = require("supertest");
const agent = require("./auth_routes_test");
const mongoose = require("mongoose");
const moment = require("moment");
moment().format();

describe("testing goal routes", () => {
  var createdTarget, createdArea, returnedUser;
  it("can create a new goal with 1 target", done => {
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
        assert.equal(
          response.body.improvementAreas[0].subject,
          "testing our API"
        );
        returnedUser = response.body;
        createdArea = response.body.improvementAreas[0];
        createdTarget = response.body.improvementAreas[0].targets[0];
        // assert.equal(response.body.improvementAreas)
        done();
      });
  });

  it("does not send back user's password on creating new goal", done => {
    assert.ok(!returnedUser.password);
    done();
  });

  it("added the correct time period to db", done => {
    assert.equal(moment(createdTarget.timePeriod).dayOfYear(), 7);
    done();
  });

  it("added the correct target time to db", done => {
    var date = moment(createdTarget.targetTime);
    var hours = (date.dayOfYear() - 1) * 24 + date.hour();
    assert.equal(hours, 35);
    done();
  });

  var ImprovementArea = mongoose.model("improvement-areas");
  var Targets = mongoose.model("targets");

  var returnedUser;
  it("can remove an improvement area", done => {
    agent
      .post("/area/remove")
      .send({ goalId: createdArea._id })
      .then(response => {
        returnedUser = response.body;
        // console.log(response);
        ImprovementArea.count().then(count => {
          assert.equal(count, 0);
          done();
        });
      });
  });

  it("removes the created target when removing the improvement area", done => {
    Targets.count().then(count => {
      assert.equal(count, 0);
      done();
    });
  });

  it("send back the user now with 0 improvement areas", done => {
    assert.equal(returnedUser.improvementAreas.length, 0);
    done();
  });

  var User = mongoose.model("users");

  it("removes the improvement area from the user database record", done => {
    User.findById(returnedUser._id).then(resp => {
      assert.equal(resp.improvementAreas.length, 0);
      done();
    });
  });

  var secondArea;

  it("can add multiple targets to the same improvement area", done => {
    agent
      .post("/area/new")
      .send({
        subject: "testing our API",
        targets: [
          {
            timePeriod: 7,
            targetTime: 35
          },
          {
            timePeriod: 1,
            targetTime: 5
          }
        ]
      })
      .then(response => {
        assert.equal(response.body.improvementAreas[0].targets.length, 2);
        secondArea = response.body.improvementAreas[0];
        done();
      });
  });

  it("will remove both targets when removed", done => {
    agent
      .post("/area/remove")
      .send({ goalId: secondArea._id })
      .then(response => {
        Targets.count().then(count => {
          assert.equal(count, 0);
          done();
        });
      });
  });
});

module.exports = agent;
