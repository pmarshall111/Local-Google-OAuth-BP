const mongoose = require("mongoose");

const info = require("./config/keys").indexInfo;
//mongoose&&model setup
mongoose.Promise = global.Promise;
mongoose
  .connect(info.db)
  .then(() => {
    console.log(`connected to ${info.db}`);
  })
  .catch(e => console.log(e));

require("./models/Users");
require("./models/ImprovementArea");
require("./models/Targets");
require("./models/Time");

const app = require("./app");
const PORT = info.port;

app.listen(PORT, () => {
  console.log("app is go: " + PORT);
});
