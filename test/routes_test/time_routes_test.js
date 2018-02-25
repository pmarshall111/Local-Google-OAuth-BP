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
  var returnedUser;
  it("can add time to an existing goal", done => {
    agent
      .post("/time/new")
      .send({
        goalId: currentGoal._id,
        time: [
          {
            timeStarted: moment().hour(20),
            timeFinished: moment(),
            tags: ["testing", "mocha", "supertest"],
            sessions: [
              {
                timeStarted: moment().hour(20),
                timeFinished: moment().hour(21)
              },
              {
                timeStarted: moment().hour(21.5),
                timeFinished: moment().hour(22)
              }
            ],
            mood: 2
          }
        ]
      })
      .then(response => {
        // console.log(response);
        returnedUser = response.body;
        assert.equal(response.body.improvementAreas[0].time.length, 1);
        done();
      });
  });

  it("does not send back user's password on creating new time", done => {
    console.log(returnedUser);
    assert.ok(!returnedUser.password);
    done();
  });

  it("does not add duplicate tags to a user", done => {
    agent
      .post("/time/new")
      .send({
        goalId: currentGoal._id,
        time: [
          {
            timeStarted: moment().hour(20),
            timeFinished: moment(),
            tags: ["testing", "mocha", "supertest"],
            sessions: [
              {
                timeStarted: moment().hour(20),
                timeFinished: moment().hour(21)
              },
              {
                timeStarted: moment().hour(21.5),
                timeFinished: moment().hour(22)
              }
            ],
            mood: 2
          }
        ]
      })
      .then(response => {
        console.log(response.body);
        assert.equal(response.body.tags.length, 3);
        done();
      });
  });
});

module.exports = agent;
