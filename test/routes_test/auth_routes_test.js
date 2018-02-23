//testing can we make an account with local strategy
//no test for oauth20

require("../../index");
var app = require("../../app");
const assert = require("assert");
const request = require("supertest");
const agent = request.agent(app);
const mongoose = require("mongoose");

before(function(done) {
  this.timeout(5000);
  // mongoose.connection.collections.users.drop(() => done())
  Promise.all([
    mongoose.model("users").remove({}),
    mongoose.model("improvement-areas").remove({}),
    mongoose.model("targets").remove({}),
    mongoose.model("time").remove({})
  ]).then(() => {
    done();
  });
});

describe("auth routes", () => {
  it("can create a local account via /auth/signup and recieve cookie", function(done) {
    agent
      .post("/auth/signup")
      .send({ email: "test", password: "test" })
      .then(response => {
        assert.ok(response.res.headers["set-cookie"]);
        done();
      });
  });
  it("check if cookie returns the user we made. call to /current-user", done => {
    agent.get("/current-user").then(response => {
      assert.ok(response.body.user.email === "test");
      done();
    });
  });

  it("cannot create an account if logged in", done => {
    agent
      .post("/auth/signup")
      .send({ email: "test1", password: "plsDontLetMeDoThis" })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  it("/logout removes cookie", function(done) {
    agent.get("/logout").then(response => {
      assert.equal(response.headers["set-cookie"][0].slice(0, 9), "session=;");
      done();
    });
  });

  it("has actually logged out the user. Call to /current-user", done => {
    agent.get("/current-user").then(response => {
      console.log(response.body);
      assert.ok(response.body.error);
      done();
    });
  });

  it("can't create a new account with the email of a current user", done => {
    agent
      .post("/auth/signup")
      .send({ email: "test", password: "test" })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  it("can't login with incorrect password", done => {
    agent
      .post("/auth/login")
      .send({ email: "test", password: "password" })
      .then(response => {
        assert.ok(response.body.error);
        done();
      });
  });

  it("get cookie data back when we login with user we created. /auth/login", done => {
    agent
      .post("/auth/login")
      .send({ email: "test", password: "test" })
      .then(response => {
        assert.ok(response.res.headers["set-cookie"]);
        done();
      });
  });

  it("check if cookie returns user who logged in. call to /current-user", done => {
    agent.get("/current-user").then(response => {
      assert.equal(response.body.user.email, "test");
      done();
    });
  });
});

module.exports = agent;
