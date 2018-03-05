const request = require("supertest");
const agent = request.agent(require("../../app"));
const moment = require("moment");
const mongoose = require("mongoose");
const Users = mongoose.model("users");

function createAccount() {
  Users.count({ email: "dummy" }).then(count => {
    if (count === 1) return;
    console.log(
      "\n ------------------------- \n Process to take approx 2 mins. \n Adding 3 improvement areas and 300 times to the following user: \n ------------------------- \n Email: dummy \n Password: dummy"
    );
    agent
      .post("/auth/signup")
      .send({ email: "dummy", password: "dummy" })
      .then(async () => {
        await addImprovementArea("testing");
        console.log("1 area plus 100 times added");
        await addImprovementArea("loads of testing");
        console.log("2 areas plus 200 times added");
        await addImprovementArea("snow is gone");

        agent.get("/logout").then(() => {
          console.log(
            "3 areas, 300 times added. Finished adding dummy data and logged out"
          );
        });
      });
  });
}

createAccount();

async function addImprovementArea(str) {
  var user = await agent.post("/area/new").send({
    subject: str,
    targets: [
      {
        timePeriod: 7,
        targetTime: 35
      },
      {
        timePeriod: 1,
        targetTime: 5
      }
    ]
  });

  // console.log(user);

  let currentAreaId = user.body.improvementAreas.filter(
    x => x.subject == str
  )[0]._id;

  await Promise.all(
    new Array(100).fill("abc").map(x => addTime(currentAreaId))
  );
}

async function addTime(id) {
  var randomMonth = Math.floor(Math.random() * 12) + 1;
  var randomDay = Math.floor(Math.random() * 28) + 1;
  var randomHour = Math.floor(Math.random() * 12) + 6;
  var createdDate = moment(
    `2017-${randomMonth}-${randomDay} ${randomHour}`,
    "YYYY-MM-DD HH"
  );

  var randomInterval = Math.floor(Math.random() * 10) / 5;

  var sessions = [
    {
      timeStarted: createdDate,
      timeFinished: moment(createdDate).add(randomInterval, "hours")
    }
  ];

  while (
    sessions[sessions.length - 1].timeFinished.isBefore(
      moment(createdDate).hour(22)
    )
  ) {
    var randomInterval = 1 + Math.floor(Math.random() * 10) / 5;
    var randomIntervalTwo = 1 + Math.floor(Math.random() * 10) / 5;

    var timeStarted = sessions[sessions.length - 1].timeFinished.add(
      randomInterval,
      "hours"
    );

    sessions.push({
      timeStarted,
      timeFinished: moment(timeStarted).add(randomIntervalTwo, "hours")
    });
  }

  var randomMood = Math.floor(Math.random() * 3) + 1;

  var randomTags = [
    "testing",
    "pls work",
    "hi",
    "mug",
    "stop ging on reddit",
    "line graph",
    "js",
    "codewars",
    "codepen",
    "frontend",
    "db",
    "stuff",
    "lfc",
    "yooo",
    "red",
    "look",
    "flower",
    "munchies",
    "forest",
    "tiger"
  ];

  var tags = [];

  for (var i = 0; i < 3; i++) {
    var randomNumb = Math.floor(Math.random() * randomTags.length);
    tags.push(randomTags[randomNumb]);
  }

  var user = await agent.post("/time/new").send({
    goalId: id,
    time: [
      {
        timeStarted: createdDate,
        timeFinished: sessions[sessions.length - 1].timeFinished,
        tags,
        sessions,
        mood: randomMood
      }
    ]
  });
}
