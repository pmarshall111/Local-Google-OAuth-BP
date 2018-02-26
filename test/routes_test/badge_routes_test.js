const assert = require("assert");
const request = require("supertest");
const agent = require("./time_routes_test");
const mongoose = require("mongoose");
const moment = require("moment");

//need to test for: can we create a new badge?

//get all badges back, with the completion percentage and how many times the user has unlocked that badge.
const Badges = mongoose.model("badges");

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

  //still need tests to logout, create a new user, then get all badges back with completion
  //percentage plus a prop on each badge to say how often a user has unlocked that badge
});

module.exports = agent;
