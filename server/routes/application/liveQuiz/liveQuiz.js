const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const router = require("express").Router();
const randomRoom = require("../../../utils/randomOtp");
const auth = require("../../../auth/adminAuth");
const { sequelize } = require("../../../db");
const { Op } = require("sequelize");
const CustomerLiveQuiz = db.customerLiveQuiz;
const CustomerLiveQuizQuestions = db.customerLiveQuizQuestions;
const LiveReport = db.liveQuizReport;
const LiveReportMaster = db.liveQuizReportMasters;
const NotificationHistory = db.notifications;
const { isNumber } = require("./../../../utils/validation");

/* ----------------- Choose By Subject----------------- */

const mandotory = [
  "roomId",
  "userId",
  "questionId",
  "user_answer",
  "time_taken",
  "correct_answer",
];

router.post("/bySubject", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.subjectId)) {
      return res.status(400).send(errorResponse(400, "Need subjectId"));
    }
    const randomRoomId = randomRoom();

    const questions = await db.questions.findAll({
      where: { subjectId: req.body.subjectId },
      limit: 10,
      order: db.sequelize.literal("rand()"),
    });

    const customer = await CustomerLiveQuiz.create({
      ...req.body,
      userId: req.user.id,
      room: randomRoomId,
    });

    let questionsRef = [];
    for (let i = 0; i < 10; i++) {
      let temp = {};
      temp["userRoomId"] = customer.id;
      temp["fixQuestionId"] = questions[i].id;
      questionsRef.push(temp);
    }

    CustomerLiveQuizQuestions.bulkCreate(questionsRef)
      .then((result) => {
        return res.status(200).send(
          successResponse("Success", 200, {
            room: customer,
            questions: questions,
          })
        );
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/report", auth, async (req, res) => {
  try {
    if (!req.body.mode) {
      if (!["default", "custom"].includes(req.body.mode))
        return res.status(400).send(errorResponse(400, `need mode`));
    }

    if (!req.body.answers) {
      return res.status(400).send(errorResponse(400, `need answers`));
    }

    let { answers } = req.body;

    if (answers.length < 1) {
      return res.status(400).send(errorResponse(400, `need answers`));
    }
    let data;

    if (typeof answers === "string") {
      answers = JSON.parse(answers);
      if (answers[0]) data = answers[0];
      else return res.status(400).send(errorResponse(400, `need answers`));
    } else data = answers[0];

    let submitReport = {
      correct: 0,
      incorrect: 0,
      skipped: 0,
      accuracy: 0,
      time_taken: 0,
      avg_time: 0,
      total_marks: 0,
    };

    /*----------------- question exist ------------------ */

    let where = {};
    let where_question = {};
    if (req.body.mode === "default") {
      const question = await db.questions.findOne({
        where: { id: data.questionId },
      });
      if (!question) {
        return res.status(400).send(errorResponse(400, "Need Valid Question"));
      }
      where["subjectId"] = question.subjectId;
      where_question["subjectId"] = question.subjectId;
      where_question["questionId"] = question.id;
    } else if (req.body.mode === "custom") {
      const question = await db.customQuestions.findOne({
        where: { id: data.questionId },
      });
      if (!question) {
        return res
          .status(400)
          .send(errorResponse(400, "Need Valid Custom Question"));
      }
      where["customMasterId"] = question.customMasterId;
      where_question["customMasterId"] = question.customMasterId;
      where_question["customQuestionId"] = question.id;
    } else {
      return res.status(400).send(errorResponse(400, "Need Valid Questions"));
    }

    answers.forEach((answer, index) => {
      var validation = mandotory.filter(function (obj) {
        return Object.keys(answer).indexOf(obj) == -1;
      });
      if (validation.length > 0) {
        throw new Error(`need ${validation} in answer ${index + 1}`);
      }
      if (
        parseInt(answer.user_answer) > -1 &&
        parseInt(answer.correct_answer) === parseInt(answer.user_answer)
      ) {
        submitReport.correct += 1;
      } else if (parseInt(answer.user_answer) === -1) {
        submitReport.skipped += 1;
      } else {
        submitReport.incorrect += 1;
      }
      submitReport.time_taken += parseInt(answer.time_taken);
    });
    submitReport.avg_time = secondsToHms(
      calculateRatio(submitReport.time_taken, answers.length)
    );
    submitReport.total_marks = answers.length;
    submitReport.accuracy = (
      (submitReport.correct / answers.length) *
      100
    ).toFixed(2);

    LiveReportMaster.create({
      userId: req.user.id,
      ...submitReport,
      ...where,
      roomId: data.roomId,
      classId: req.user.class,
    })
      .then((result) => {
        answers = answers.map((obj) => ({
          ...obj,
          ...where_question,
          reportId: result.id,
        }));
        LiveReport.bulkCreate(answers)
          .then(() => {
            return res
              .status(200)
              .send(successResponse("Submitted", 200, submitReport));
          })
          .catch((err) => {
            return res.status(500).send(errorResponse(500, err, toString()));
          });
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err, toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/leaderboard", auth, async (req, res) => {
  try {
    if (req.body.mode === "solo") {
      let otheruser;
      if (req.body.userId) {
        if (!parseInt(req.body.userId)) {
          return res.status(400).send(errorResponse(400, "Need Proper UserID"));
        }
        otheruser = await db.users.findOne({
          where: {
            id: parseInt(req.body.userId),
          },
        });
      }
      const user = await db.users.findAll({
        attributes: [
          "id",
          "username",
          "userProfileImage",
          "thumbnail",
          "buddies",
        ],
        group: ["id"],
        where: {
          class: req.body.userId
            ? otheruser
              ? otheruser.class
              : req.user.class
            : req.user.class,
        },
        include: [
          {
            model: db.liveQuizReportMasters,
            as: "reportMaster",
            required: false,
            where: {
              classId: req.body.userId
                ? otheruser
                  ? otheruser.class
                  : req.user.class
                : req.user.class,
              customMasterId: null,
            },
            attributes: [
              [
                db.sequelize.literal(`RANK() OVER(order by sum(correct) desc)`),
                "rank",
              ],
              [db.sequelize.literal(`sum(correct)`), "points"],
              [db.sequelize.literal(`count(correct)`), "game_played"],
            ],
          },
        ],
      });
      let result;
      let likes = await db.posts.sum("likes", {
        where: {
          userId: req.body.userId || req.user.id,
        },
      });

      if (req.body.userId) {
        result = user.find((i) => i.id === parseInt(req.body.userId));
      } else {
        result = user.find((i) => i.id === parseInt(req.user.id));
      }
      if (result) result.dataValues["likes"] = likes || 0;
      return res
        .status(200)
        .send(successResponse("Success", 200, result || null));
    } else if (req.body.mode === "public") {
      const user = await db.users.findAll({
        attributes: [
          "id",
          "username",
          "userProfileImage",
          "thumbnail",
          "buddies",
        ],
        group: ["id"],
        where: { class: req.user.class },
        include: [
          {
            // group: ["id"],
            model: db.liveQuizReportMasters,
            as: "reportMaster",
            required: false,
            where: { classId: req.user.class, customMasterId: null },
            attributes: [
              [
                db.sequelize.literal(`RANK() OVER(order by sum(correct) desc)`),
                "rank",
              ],
              [db.sequelize.literal(`sum(correct)`), "points"],
              [db.sequelize.literal(`count(correct)`), "game_played"],
            ],
          },
        ],
      });
      let result = user;
      return res
        .status(200)
        .send(successResponse("Success", 200, result || null));
    } else if (req.body.mode === "quizResult") {
      if (req.body.room) {
        if (!parseInt(req.body.room)) {
          return res.status(400).send(errorResponse(400, "Need Room Number"));
        }
      } else {
        return res.status(400).send(errorResponse(400, "Need Room Number"));
      }
      if (req.body.roomId) {
        if (!parseInt(req.body.roomId)) {
          return res.status(400).send(errorResponse(400, "Need Room Id"));
        }
      } else {
        return res.status(400).send(errorResponse(400, "Need Room Number"));
      }
      const leaderboard = await LiveReportMaster.findAll({
        include: [
          {
            model: db.users,
            as: "user",
            attributes: [
              "id",
              "username",
              "userProfileImage",
              "thumbnail",
              "buddies",
            ],
            required: false,
          },
          {
            model: db.customerLiveQuiz,
            as: "room",
            required: true,
            attributes: [],
            where: { id: req.body.roomId },
          },
        ],
        where: { classId: req.user.class },
        attributes: [
          "correct",
          "incorrect",
          "skipped",
          "time_taken",
          "avg_time",
          "accuracy",
          "total_marks",
          ["correct", "points"],
          [db.sequelize.literal(`RANK() OVER(order by correct desc)`), "rank"],
        ],
      });
      let md = req.body.room + "_played";
      let check = await db.customerLiveQuiz.findOne({
        where: { room: md },
      });
      if (!check) {
        await db.customerLiveQuiz.update(
          {
            room: db.sequelize.fn(
              "CONCAT",
              db.sequelize.col("room"),
              "_played"
            ),
          },
          {
            where: {
              room: req.body.room,
            },
          }
        );
      }
      return res.status(200).send(successResponse("Success", 200, leaderboard));
    }
    res.status(400).send(errorResponse(400, "Mode Required"));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

function calculateRatio(num_1, num_2) {
  return (num_1 / num_2).toFixed(2);
}

function secondsToHms(secs) {
  var hours = Math.floor(secs / (60 * 60));

  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  var hDisplay = hours > 0 ? hours + (hours == 1 ? "h " : "h ") : "";
  return hDisplay + minutes + "m " + seconds + "s";
}

router.post("/shareCode", auth, async (req, res) => {
  try {
    if (!req.body.numbers) {
      return res.status(400).send(errorResponse(400, "Need Numbers"));
    }
    if (!isNumber(req.body.roomId)) {
      return res.status(400).send(errorResponse(400, "Need Room Id"));
    }
    const numbers = req.body.numbers
      .replace(new RegExp('"', "g"), "")
      .replace("[", "")
      .replace("]", "")
      .split(",");

    if (numbers.length > 0 && numbers[0] === "")
      return res.status(400).send(errorResponse(400, "Need Numbers"));

    numbers.map((i, index) => {
      if (!parseInt(i))
        return res
          .status(400)
          .send(errorResponse(400, `Got ${i}, need valid userId`));
    });
    const result = await db.users.findAll({
      where: {
        id: {
          [Op.in]: numbers,
        },
      },
      attributes: ["id", "registrationToken"],
    });

    var payload = {
      notification: {
        title: `${
          req.user.username || req.user.phoneNumber || req.user.email
        } has invited you to play live quiz.`,
        body: `Room: ${req.body.roomId}`,
      },
      data: {
        title: `${
          req.user.username || req.user.phoneNumber || req.user.email
        } has invited you to play live quiz.`,
        body: `Room: ${req.body.roomId}`,
        room: req.body.roomId,
      },
    };

    let promise = [];
    result.map((i, index) => {
      if (i.registrationToken)
        promise.push(sendNotification(i.registrationToken, payload, i.id, req));
    });

    Promise.all(promise)
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((error) => {
        return res.status(500).send(errorResponse(500, error.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

function sendNotification(token, payload, id, req) {
  return new Promise(async function (resolve, reject) {
    const admin = req.app.get("admin");
    admin
      .messaging()
      .sendToDevice(token, payload)
      .then(function (response) {
        NotificationHistory.create({
          ...payload.notification,
          userId: id,
          room: payload.data.room,
          notifyType: 1,
        })
          .then((result) => {
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

module.exports = router;
