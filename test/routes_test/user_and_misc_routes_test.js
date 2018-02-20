//need to try cross account removal of goals and targets.
//plus cross account addition of time.
//plus deleting a user and seeing if all their stuff is gone

const assert = require("assert");
const request = require("supertest");
const agent = require("./time_routes_test");
const mongoose = require("mongoose");
const moment = require("moment");
moment().format();

describe("misc routes", () => {
  var firstUser;
  it("can get current user", done => {
    agent.get("/current-user").then(response => {
      firstUser = response.body.user;
      assert.equal(response.body.user.email, "test");
      done();
    });
  });

  it("logging out", done => {
    agent.get("/logout").then(response => {
      assert.equal(response.headers["set-cookie"][0].slice(0, 9), "session=;");
      done();
    });
  });

  it("confirm we are logged out", done => {
    agent.get("/current-user").then(response => {
      assert.ok(response.body.error);
      done();
    });
  });

  it("creating a new account", done => {
    agent
      .post("/auth/signup")
      .send({ email: "testNew", password: "test" })
      .then(response => {
        assert.ok(response.res.headers["set-cookie"]);
        done();
      });
  });

  it("can't remove another user's goals", done => {
    agent
      .post("/area/remove")
      .send({ goalId: firstUser.improvementAreas[0]._id })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  it("can't remove another user's targets", done => {
    agent
      .post("/target/remove")
      .send({ targetId: firstUser.improvementAreas[0].targets[0]._id })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  it("can't update another user's targets", done => {
    agent
      .post("/target/update")
      .send({
        targetId: firstUser.improvementAreas[0].targets[0]._id,
        updates: {
          timePeriod: 2,
          targetTime: 12,
          fillAllWeeks: false
        }
      })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  it("can't add time to another user's targets", done => {
    agent
      .post("/time/new")
      .send({
        targetId: firstUser.improvementAreas[0]._id,
        time: {
          timeStarted: moment().hour(10),
          timeFinished: moment(),
          tags: ["testing, mocha, supertest"],
          mood: 3
        }
      })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  var User = mongoose.model("users");

  it("can remove a user", done => {
    agent.get("/user/remove").then(response => {
      User.count().then(count => {
        assert.equal(count, 1);
        done();
      });
    });
  });

  it("can login to first user", done => {
    agent
      .post("/auth/login")
      .send({ email: "test", password: "test" })
      .then(response => {
        assert.ok(response.res.headers["set-cookie"]);
        done();
      });
  });

  it("can update a user", done => {
    agent
      .post("/user/update")
      .send({ email: "test2", password: "test2" })
      .then(response => {
        // console.log(response);
        assert.equal(response.body.email, "test2");
        done();
      });
  });
  //
  var User = mongoose.model("users");
  var ImprovementAreas = mongoose.model("improvement-areas");
  var Targets = mongoose.model("targets");
  var Time = mongoose.model("time");

  it("can remove a user and all child documents", done => {
    agent.get("/user/remove").then(response => {
      Promise.all([
        User.count(),
        ImprovementAreas.count(),
        Targets.count(),
        Time.count()
      ]).then(results => {
        var totalRecords = results.reduce((t, c) => (t += c), 0);
        assert.equal(totalRecords, 0);
        done();
      });
    });
  });
});
