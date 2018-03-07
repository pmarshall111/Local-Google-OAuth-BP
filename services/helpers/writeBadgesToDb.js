const mongoose = require("mongoose");

const Badges = mongoose.model("badges");

//added function so that we can use await
async function addBadges() {
  var count = await Badges.count();
  if (count > 0) return;

  var badges = [
    {
      title: "Making strides",
      description: "Work for 3 hours in a day",
      target: 3,
      points: 10,
      category: "Time over a day"
    },
    {
      title: "Climbing Mountains",
      description: "Work for 7 hours in a day",
      points: 50,
      target: 7,
      category: "Time over a day"
    },
    {
      title: "Top of the world!",
      description: "Work for 12 hours in a day",
      points: 100,
      target: 12,
      category: "Time over a day"
    },
    {
      title: "Extra curricular",
      description: "Work for 5 hours over 1 week",
      target: 5,
      points: 10,
      category: "Time over a week"
    },
    {
      title: "Part-time Worker",
      description: "Work for 15 hours over 1 week",
      points: 50,
      target: 15,
      category: "Time over a week"
    },
    {
      title: "Full-time Hero!",
      description: "Work for 35 hours over 1 week",
      points: 100,
      target: 35,
      category: "Time over a week"
    },
    {
      title: "20 points",
      description: "Complete 20 targets",

      points: 10,
      target: 20,
      category: "Total targets"
    },
    {
      title: "Bullseye!",
      description: "Complete 50 targets",
      points: 50,
      target: 50,
      category: "Total targets"
    },
    {
      title: "Onnneeee hundred and eighty!!!",
      description: "Complete 180 targets",
      points: 100,
      target: 180,
      category: "Total targets"
    },
    {
      title: "On a roll",
      description: "Hit 3 targets in a row",
      points: 10,
      target: 3,
      category: "Consecutive targets"
    },
    {
      title: "Can't stop me now!",
      description: "Hit 5 targets in a row",
      points: 50,
      target: 5,
      category: "Consecutive targets"
    },
    {
      title: "Too Easy for me!",
      description: "Hit 10 targets in a row",
      points: 100,
      target: 10,
      category: "Consecutive targets"
    },
    {
      title: "Working week",
      description: "Register time for 7 days in a row",
      points: 50,
      target: 7,
      category: "Days logged in"
    },
    {
      title: "Working month",
      description: "Register time for 30 days in a row",
      points: 100,
      target: 30,
      category: "Days logged in"
    }
  ];

  var sendToMongo = badges.map(x => {
    return {
      insertOne: {
        document: x
      }
    };
  });

  var sent = await Badges.bulkWrite(sendToMongo);

  console.log(`Inserted ${sent.insertedCount} badges to database`);
}

addBadges();
