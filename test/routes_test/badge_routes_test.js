const assert = require("assert");
const request = require("supertest");
const agent = require("./time_routes_test");
const mongoose = require("mongoose");
const moment = require("moment");

//need to test for: can we create a new badge?

//get all badges back, with the completion percentage and how many times the user has unlocked that badge.
const Badges = mongoose.model("badges");
const Users = mongoose.model("users");

describe("badge routes", () => {
  var createdBadge;

  it("can create a new badge", done => {
    var badgeTitle = "You Rock!";

    agent
      .post("/badges/new")
      .send({ title: badgeTitle, points: 50 })
      .then(response => {
        createdBadge = response.body;
        Badges.count({ title: badgeTitle }).then(res => {
          assert.equal(res, 1);
          done();
        });
      });
  });

  var updatedBadge;

  it("can add a user to the earnedBy property", done => {
    agent
      .post("/badges/unlock")
      .send({ badgeId: createdBadge._id })
      .then(response => {
        updatedBadge = response.body;
        assert.equal(response.body.earnedBy.length, 1);
        done();
      });
  });

  it("sets the number of times a user has earned a badge to 1 when first unlocking", done => {
    assert.equal(updatedBadge.earnedBy[0].times, 1);
    done();
  });

  it("doesn't create duplicate entries in earnedBy if unlocked again by the same user", done => {
    agent
      .post("/badges/unlock")
      .send({ badgeId: updatedBadge._id })
      .then(response => {
        updatedBadge = response.body;
        assert.equal(response.body.earnedBy.length, 1);
        done();
      });
  });

  it("when unlocked more than once, earnedBy user's times property is incremented", done => {
    assert.equal(updatedBadge.earnedBy[0].times, 2);
    done();
  });

  var secondBadge;

  it("creates a second badge", done => {
    var secondBadgeTitle = "Second badge";
    agent
      .post("/badges/new")
      .send({ title: secondBadgeTitle, points: 5 })
      .then(response => {
        secondBadge = response.body;
        Badges.count({ title: secondBadgeTitle }).then(res => {
          assert.equal(res, 1);
          done();
        });
      });
  });

  //still need tests to logout, create a new user, then get all badges back with completion
  //percentage plus a prop on each badge to say how often a user has unlocked that badge

  it("logging out", done => {
    agent.get("/logout").then(() => {
      agent.get("/current-user").then(response => {
        assert.ok(response.body.error);
        done();
      });
    });
  });

  it("can create a new account", done => {
    agent
      .post("/auth/signup")
      .send({ email: "test2", password: "test2" })
      .then(() => {
        agent.get("/current-user").then(response => {
          assert.ok(response.body.user.email, "test2");
          done();
        });
      });
  });

  it("non-admin user can't create a new badge", done => {
    agent
      .post("/badges/new")
      .send({ title: "hacker badge", points: 5000000 })
      .then(response => {
        Badges.count({ title: "hacker badge" }).then(res => {
          assert.equal(res, 0);
          done();
        });
      });
  });

  //add ourselves to the second badge. then we will get all badges and check
  //that the completion percentage is there and also that we have the number of times
  //that badge has been completed by a user.

  it("can unlock badge for non-admin user", done => {
    agent
      .post("/badges/unlock")
      .send({ badgeId: secondBadge._id })
      .then(response => {
        assert.equal(response.body.earnedBy.length, 1);
        done();
      });
  });

  var allBadges;

  it("can get all badges back from db", done => {
    agent.get("/badges").then(response => {
      allBadges = response.body;
      Badges.count().then(count => {
        assert.equal(response.body.length, count);
        done();
      });
    });
  });

  it("has the correct number of user completions for each badge", done => {
    var first = allBadges.filter(x => x._id.toString() == createdBadge._id)[0];
    var second = allBadges.filter(x => x._id.toString() == secondBadge._id)[0];
    var userCompletions = [first.userCompletions, second.userCompletions];
    assert.deepEqual(userCompletions, [0, 1]);
    done();
  });

  it("calculates the percentage unlocked correctly", function(done) {
    this.timeout(5000);
    var first = allBadges.filter(x => x._id.toString() == createdBadge._id)[0];
    var second = allBadges.filter(x => x._id.toString() == secondBadge._id)[0];
    var percentageUnlocked = [
      first.percentageUnlocked,
      second.percentageUnlocked
    ];
    Promise.all([Users.count(), Badges.find()]).then(
      ([totalUsers, completeBadges]) => {
        var calcPercentage = completeBadges.map(x => {
          var numUsersUnlocked = x.earnedBy.length;
          return numUsersUnlocked / totalUsers * 100;
        });

        assert.deepEqual(percentageUnlocked, calcPercentage);
        done();
      }
    );
  });

  it("logging out", done => {
    agent.get("/logout").then(() => {
      agent.get("/current-user").then(response => {
        assert.ok(response.body.error);
        done();
      });
    });
  });

  it("logging into admin", done => {
    agent
      .post("/auth/login")
      .send({ email: "test", password: "test" })
      .then(() => {
        agent.get("/current-user").then(response => {
          assert.equal(response.body.user.email, "test");
          done();
        });
      });
  });

  it("can still calculate percentage if badge has no completions", done => {
    var zeroCompletions = "zero completions";
    agent
      .post("/badges/new")
      .send({ title: zeroCompletions, points: 0 })
      .then(res => {
        var badge = res.body;
        agent.get("/badges").then(response => {
          console.log(response);
          var zeroBadge = response.body.filter(
            x => x._id.toString() == badge._id.toString()
          )[0];
          assert.equal(zeroBadge.percentageUnlocked, 0);
          done();
        });
      });
  });
});

module.exports = agent;
