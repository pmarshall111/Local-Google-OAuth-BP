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
  var currentUser;
  it("can get current user", done => {
    agent.get("/current-user").then(response => {
      currentUser = response.body.user;
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
        console.log(response);
        assert.ok(response.res.headers["set-cookie"]);
        done();
      });
  });

  // it("can't remove another user", done => {});
});
