const mongoose = require("mongoose");

//mongoose&&model setup
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/time-counter");
require("./models/Users");
require("./models/ImprovementArea");
require("./models/Targets");
require("./models/Time");

const app = require("./app");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("app is go: " + PORT);
});
