const mongoose = require("mongoose");

const info = require("./config/keys").indexInfo;

var env = process.env.NODE_ENV || "development";
env.trim();

//mongoose&&model setup
mongoose.Promise = global.Promise;
mongoose
  .connect(info.db)
  .then(async () => {
    console.log(`connected to ${info.db}`);
    require("./models/Users");
    require("./models/ImprovementArea");
    require("./models/Targets");
    require("./models/Days");
    require("./models/Time");
    require("./models/Badges");

    //adding badges if no badges
    await require("./services/helpers/writeBadgesToDb");

    //adding test user if in dev
    if (env === "development")
      require("./services/helpers/createUserDummyData");

    const app = require("./app");
    const PORT = info.port;

    app.listen(PORT, () => {
      console.log("app is go: " + PORT);
    });
  })
  .catch(e => console.log(e));
