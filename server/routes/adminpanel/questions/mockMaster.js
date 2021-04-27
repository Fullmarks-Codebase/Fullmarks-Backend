const router = require("express").Router();
const auth = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const { Op } = require("sequelize");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const MockMaster = db.mockMaster;
const { calculateRatio, secondsToHms } = require("../../../utils/functions");
const { isNumber } = require("../../../utils/validation");
const { mockMaster } = require("../../../db");

router.post("/", auth, (req, res) => {
  try {
    let where = {};
    if (req.body.classId) {
      where["classId"] = req.body.classId;
    } else {
      where["classId"] = req.user.class;
    }
    if (req.body.id) {
      where["id"] = req.body.id;
    }

    MockMaster.findAll({
      where: where,
      include: [
        {
          model: db.mockReportMaster,
          as: "mockMaster",
          required: false,
          attributes: [],
          where: {
            userId: req.user.id,
          },
        },
        {
          model: db.mockQuestions,
          as: "questions",
          required: false,
          attributes: [],
          group: ["id"],
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.literal(" IF(count(mockMaster.userId) > 0, 1, 0)"),
            "submitted",
          ],
          [db.sequelize.literal("count(questions.id)"), "question_count"],
        ],
      },
      group: ["id"],
    })
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        res.send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/add", auth, checkAdmin, async (req, res) => {
  try {
    //time in seconds
    if (
      !req.body.name ||
      !isNumber(req.body.time) ||
      !isNumber(req.body.classId)
    ) {
      return res.send(errorResponse(400, "Need Name and Time"));
    }

    if (req.body.name.length < 0) {
      return res.send(errorResponse(400, "Need Name"));
    }
    if (!req.body.incorrect_marks || !req.body.correct_marks) {
      return res.send(
        errorResponse(400, "Neeed incorrectMarks and correctMarks")
      );
    }
    const name = req.body.name.trim();

    const validation = await MockMaster.findOne({
      where: { name: { [Op.like]: name } },
    });

    if (validation) {
      return res.send(errorResponse(400, "Name Already Exists"));
    }

    MockMaster.create({
      name: name,
      time: req.body.time,
      correct_marks: req.body.correct_marks,
      incorrect_marks: req.body.incorrect_marks,
      classId: req.body.classId,
    })
      .then((result) => {
        return res.status(201).send(successResponse("Mock Created", 200));
      })
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });
  } catch (error) {
    console.log(error);
    res.send(errorResponse(500, error.toString()));
  }
});

router.delete("/:id", auth, checkAdmin, (req, res) => {
  try {
    if (!req.params.id) {
      return res.send(errorResponse(400, "need id"));
    }
    MockMaster.destroy({ where: { id: req.params.id } })
      .then((result) => {
        return res.status(200).send(successResponse("Mock Deleted", 200));
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (error) {
    res.send(errorResponse(500, error.toString()));
  }
});

router.put("/update", auth, checkAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !parseInt(req.body.id) ||
      !req.body.name
    ) {
      return res.send(errorResponse(400, "Need Id and name"));
    }
    if (!req.body.name.trim()) {
      return res.send(errorResponse(400, "Need Proper Name"));
    }

    const mock = await MockMaster.findOne({
      where: {
        id: req.body.id,
      },
    });

    const checkIfExist = await MockMaster.findAll({
      where: { name: { [Op.like]: req.body.name } },
    });
    if (checkIfExist.length > 1) {
      return res.send(errorResponse(400, "Already Exist"));
    }

    mock.name = req.body.name;
    mock.time = parseInt(req.body.time) || mock.time;
    mock.incorrect_marks = req.body.incorrect_marks;
    mock.correct_marks = req.body.correct_marks;
    await mock.save();
    res.status(200).send(successResponse("Mock Updated", 200));
  } catch (error) {
    res.send(errorResponse(500, error.toString()));
  }
});

const mandotory = [
  "mockId",
  "userId",
  "questionId",
  "user_answer",
  "time_taken",
  "correct_answer",
];

router.post("/report", auth, async (req, res) => {
  try {
    if (!req.body.answers) {
      return res.send(errorResponse(400, `need answers`));
    }
    let { answers } = req.body;

    if (answers.length < 1) {
      return res.send(errorResponse(400, `need answers`));
    }
    let data;

    if (typeof answers === "string") {
      answers = JSON.parse(answers);
      if (answers[0]) data = answers[0];
      else return res.send(errorResponse(400, `need answers`));
    } else data = answers[0];

    let submitReport = {
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      skipped: 0,
      time_taken: 0,
      avg_time: 0,
      total_marks: 0,
    };

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

    db.mockReportMaster
      .create({
        ...submitReport,
        userId: req.user.id,
        mockId: data.mockId,
      })
      .then((result) => {
        answers = answers.map((obj) => ({
          ...obj,
          mockId: data.mockId,
          mockReportMasterId: result.id,
          questionId: obj.questionId,
        }));
        db.mockReport
          .bulkCreate(answers)
          .then(() => {
            return res
              .status(200)
              .send(successResponse("Submitted", 200, submitReport));
          })
          .catch((err) => {
            return res.send(errorResponse(500, err, toString()));
          });
      })
      .catch((err) => {
        return res.send(errorResponse(500, err, toString()));
      });
  } catch (err) {
    return res.send(errorResponse(500, err.toString()));
  }
});

router.post("/myReport", auth, (req, res) => {
  try {
    if (!req.body.mockId) {
      return res.send(errorResponse(400, "Need MockId"));
    }

    db.mockReportMaster
      .findOne({
        where: {
          userId: req.user.id,
          mockId: parseInt(req.body.mockId),
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        include: [
          {
            model: db.mockReport,
            as: "questions",
            required: false,
            include: [
              {
                model: db.mockQuestions,
                as: "question",
                required: true,
              },
            ],
          },
        ],
      })
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.send(errorResponse(500, err.toString()));
      });
  } catch (error) {}
});

module.exports = router;
