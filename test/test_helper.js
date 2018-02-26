//Have found out that tests should be completely isolated from eachother.
//Will design differently in future projects
require("../index");
const mongoose = require("mongoose");

before(function(done) {
  this.timeout(5000);
  Promise.all([
    mongoose.model("users").remove({}),
    mongoose.model("improvement-areas").remove({}),
    mongoose.model("targets").remove({}),
    mongoose.model("time").remove({}),
    mongoose.model("badges").remove({})
  ]).then(() => {
    done();
  });
});

//use this file to require in the last tests to fire.

//each test file requires in the one that is scheduled to go before it. This ensures
//that the last to be required in through the chain will go first and we can guarantee
//an order.
require("./routes_test/user_and_misc_routes_test");
