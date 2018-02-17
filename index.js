const mongoose = require("mongoose");

var option = {
  keepAlive: 300000,
  connectTimeoutMS: 30000
};
//mongoose&&model setup
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/time-counter", option)
  .then(() => {
    console.log("connected");
    require("./models/Users");
    require("./models/ImprovementArea");
    require("./models/TargetCollection");
    require("./models/Targets");
    require("./models/Time");

    const app = require("./app");
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("app is go: " + PORT);
    });
  })
  .catch(e => console.log(e));
