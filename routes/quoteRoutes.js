const quotes = require("../quotes");

module.exports = app => {
  app.get("/quoteoftheday", (req, res) => {
    var quote = quotes[Math.floor(Math.random() * quotes.length)];
    res.send({ quote });
  });
};
