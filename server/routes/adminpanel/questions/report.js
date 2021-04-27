const auth = require("../../../auth/adminAuth");
const guestCheck = require("../../../auth/guest");
const db = require("../../../db");
const Report = db.reports;
const Question = db.questions;
const ReportMaster = db.reportMaster;
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
var router = require("express").Router();

const mandotory = [
  "userId",
  "questionId",
  "user_answer",
  "time_taken",
  "correct_answer",
];

router.post("/add", guestCheck, auth, async (req, res) => {
  try {
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

    const questions = await Question.findOne({
      where: { id: data.questionId },
    });
    if (!questions) {
      return res.status(400).send(errorResponse(400, "Need Valid Data"));
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

    const existingReport = await ReportMaster.findOne({
      where: {
        userId: req.user.id,
        classId: questions.classId,
        topicId: questions.topicId,
        setId: questions.setId,
        subjectId: questions.subjectId,
      },
    });

    if (existingReport) {
      const result = await ReportMaster.update(
        { ...submitReport },
        {
          where: {
            id: existingReport.id,
          },
        }
      ).catch((err) => {
        // return res.status
      });
      return res
        .status(200)
        .send(successResponse("Submitted", 200, submitReport));
    }

    ReportMaster.create({
      userId: req.user.id,
      ...submitReport,
      classId: questions.classId,
      topicId: questions.topicId,
      setId: questions.setId,
      subjectId: questions.subjectId,
    })
      .then((result) => {
        answers = answers.map((obj) => ({
          ...obj,
          classId: questions.classId,
          topicId: questions.topicId,
          setId: questions.setId,
          subjectId: questions.subjectId,
          reportId: result.id,
        }));
        Report.bulkCreate(answers)
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

router.post("/overall", auth, (req, res) => {
  try {
    if (!parseInt(req.body.classId)) {
      return res
        .status(400)
        .send(errorResponse(500, "Need User Id and Class Id"));
    }
    ReportMaster.findOne({
      where: { userId: req.user.id, classId: req.body.classId },
      attributes: [
        [db.sequelize.fn("sum", db.sequelize.col("correct")), "correct"],
        [db.sequelize.fn("sum", db.sequelize.col("incorrect")), "incorrect"],
        [db.sequelize.fn("sum", db.sequelize.col("time_taken")), "time_taken"],
        [db.sequelize.fn("sum", db.sequelize.col("skipped")), "skipped"],
      ],
    })
      .then((result) => {
        let report = result.dataValues;
        report["accuracy"] = (
          (parseInt(result.correct) /
            (parseInt(result.correct) + parseInt(result.incorrect))) *
          100
        ).toFixed(2);
        report["avg_time"] = secondsToHms(
          calculateRatio(
            parseInt(result.time_taken),
            parseInt(result.correct) + parseInt(result.incorrect)
          )
        );
        res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/subject", auth, (req, res) => {
  try {
    if (!parseInt(req.body.classId)) {
      return res.status(400).send(errorResponse(500, "Need ClassId"));
    }
    let add = {};
    if (req.body.subjectId) {
      if (parseInt(req.body.subjectId)) {
        add["subjectId"] = req.body.subjectId;
      } else {
        return res
          .status(400)
          .send(errorResponse(400, "Need Proper SubjectId"));
      }
    }
    ReportMaster.findAll({
      where: { userId: req.user.id, classId: req.body.classId, ...add },
      attributes: [
        "classId",
        [db.sequelize.fn("sum", db.sequelize.col("correct")), "correct"],
        [db.sequelize.fn("sum", db.sequelize.col("incorrect")), "incorrect"],
        [db.sequelize.fn("sum", db.sequelize.col("skipped")), "skipped"],
        [db.sequelize.fn("sum", db.sequelize.col("time_taken")), "time_taken"],
      ],
      include: [
        {
          model: db.subjects,
          as: "subject",
          required: false,
        },
      ],
      group: ["subjectId"],
    })
      .then((result) => {
        let report = result;
        report.map((i, index) => {
          i["accuracy"] = (
            (parseInt(i.correct) /
              (parseInt(i.correct) + parseInt(i.incorrect))) *
            100
          ).toFixed(2);
          i["avg_time"] = secondsToHms(
            calculateRatio(
              parseInt(i.time_taken),
              parseInt(i.correct) + parseInt(i.incorrect)
            )
          );
        });
        res.status(200).send(successResponse("Success", 200, report));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(400));
  }
});

router.post("/set", auth, (req, res) => {
  try {
    if (!parseInt(req.body.classId) || !parseInt(req.body.subjectId)) {
      return res
        .status(400)
        .send(errorResponse(500, "Need User Id, ClassId, and SubjectId"));
    }
    ReportMaster.findAll({
      where: {
        userId: req.user.id,
        subjectId: req.body.subjectId,
      },
      attributes: [
        [db.sequelize.fn("sum", db.sequelize.col("correct")), "correct"],
        [db.sequelize.fn("sum", db.sequelize.col("incorrect")), "incorrect"],
        [db.sequelize.fn("sum", db.sequelize.col("time_taken")), "time_taken"],
        [db.sequelize.fn("sum", db.sequelize.col("skipped")), "skipped"],
      ],
      include: [
        {
          model: db.subjects,
          as: "subject",
          required: false,
        },
        {
          model: db.topics,
          as: "topic",
          required: false,
        },
        {
          model: db.sets,
          as: "set",
          required: false,
        },
      ],
      group: ["setId"],
    })
      .then((result) => {
        let report = result;
        report.map((i, index) => {
          i.dataValues["accuracy"] = (
            (parseInt(i.correct) /
              (parseInt(i.correct) + parseInt(i.incorrect))) *
            100
          ).toFixed(2);
          i.dataValues["avg_time"] = secondsToHms(
            calculateRatio(
              parseInt(i.time_taken),
              parseInt(i.correct) + parseInt(i.incorrect)
            )
          );
        });
        res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/myReport", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.setId)) {
      return res.status(400).send(errorResponse(400, "Need setId"));
    }
    const report = await ReportMaster.findOne({
      where: {
        setId: req.body.setId,
        userId: req.user.id,
      },
      include: [
        {
          model: db.reports,
          as: "reportDetail",
          required: false,
          include: [
            {
              model: db.questions,
              as: "question",
              required: false,
            },
          ],
        },
      ],
    });
    return res.status(200).send(successResponse("Success", 200, report));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

// function calculateRatio(num_1, num_2) {
//   for (num = num_2; num > 1; num--) {
//     if (num_1 % num == 0 && num_2 % num == 0) {
//       num_1 = num_1 / num;
//       num_2 = num_2 / num;
//     }
//   }
//   var ratio = num_1 + ":" + num_2;
//   return ratio;
// }
function calculateRatio(num_1, num_2) {
  return (num_1 / num_2).toFixed(2);
}

function secondsToHms(secs) {
  var hours = Math.floor(secs / (60 * 60));

  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  // var obj = {
  //     "h": hours,
  //     "m": minutes,
  //     "s": seconds
  // };
  // return obj;
  var hDisplay = hours > 0 ? hours + (hours == 1 ? "h " : "h ") : "";
  return hDisplay + minutes + "m " + seconds + "s";
}

module.exports = router;
