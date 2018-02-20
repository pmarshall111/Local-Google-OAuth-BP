const assert = require("assert");
const request = require("supertest");
const agent = require("./target_routes_test");
const mongoose = require("mongoose");
const moment = require("moment");
moment().format();

describe("time routes", () => {
  var currentGoal;
  it("can get existing goal to add time to", done => {
    agent.get("/current-user").then(response => {
      currentGoal = response.body.user.improvementAreas[0];
      assert.ok(currentGoal);
      done();
    });
  });
  var createdTime;
  it("can add time to an existing goal", done => {
    agent
      .post("/time/new")
      .send({
        goalId: currentGoal._id,
        time: {
          timeStarted: moment().hour(20),
          timeFinished: moment(),
          tags: ["testing, mocha, supertest"],
          mood: 2
        }
      })
      .then(response => {
        createdTime = response.body.improvementAreas[0].time[0];
        assert.equal(response.body.improvementAreas[0].time.length, 1);
        done();
      });
  });
});

module.exports = agent;
