const router = require("express").Router();
const authAdmin = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const MockQuestions = db.mockQuestions;
const {
  singleImageAdd,
  singleImageDelete,
  singleImageUpdate,
} = require("../../../utils/ImageUtils");
const { Sequelize } = require("../../../db");

router.post("/byMockId", authAdmin, async (req, res) => {
  try {
    if (!req.body.mockId) {
      return res.status(400).send(errorResponse(400, "need mockId"));
    }

    let count = await MockQuestions.findAll({
      where: {
        mockId: req.body.mockId,
      },

      attributes: [
        "fixSubjectId",
        [
          Sequelize.fn("COUNT", Sequelize.col("fix_subject.id")),
          "subjectCount",
        ],
      ],
      include: [
        {
          model: db.fixSubject,
          as: "fix_subject",
          attributes: ["name"],
        },
      ],
      group: ["mock_questions.fixSubjectId"],
    });
    MockQuestions.findAll({
      where: {
        mockId: req.body.mockId,
      },
    })
      .then((questions) => {
        let response = { questions, count };
        return db.mockMaster
          .findOne({
            where: {
              id: req.body.mockId,
            },
          })
          .then((mock) => {
            response = { ...response, mock };
            return res
              .status(200)
              .send(successResponse("Success", 200, response));
          });
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/", authAdmin, async (req, res) => {
  try {
    let where = {};
    if (req.body.questionId) {
      where["id"] = req.body.questionId;
      const question = await MockQuestions.findOne({ where: where });
      if (!question) {
        return res
          .status(404)
          .send(errorResponse(404, `Mock Question Doesn't Exist`));
      }
    }
    const questions = await MockQuestions.findAll({ where: where });
    res.status(200).send(successResponse("Success", 200, questions));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/add", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return res
        .status(400)
        .send(
          errorResponse(
            400,
            "need atleast subjectid, topicId, question, fixSubjectId"
          )
        );
    }

    let imageName = [
      "ans_one_image",
      "ans_two_image",
      "ans_three_image",
      "ans_four_image",
      "question_image",
    ];
    let fileNames = {
      ans_one_image: null,
      ans_two_image: null,
      ans_three_image: null,
      ans_four_image: null,
      question_image: null,
    };

    for (let i = 0; i < 5; i++) {
      if (req.files) {
        const myFile = req.files[imageName[i]];
        if (myFile && imageName[i] === "question_image") {
          const result = singleImageAdd(myFile, "question", req);
          if (result.status === 0) {
            return res.status(500).send(errorResponse(500, result.err));
          }
          fileNames[imageName[i]] = result.name;
          continue;
        } else if (myFile) {
          const result = singleImageAdd(myFile, "answers", req);
          if (result.status === 0) {
            return res.status(500).send(errorResponse(500, result.err));
          }
          fileNames[imageName[i]] = result.name;
        }
      }
    }
    MockQuestions.create({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ans_one_image: fileNames.ans_one_image,
      ans_two_image: fileNames.ans_two_image,
      ans_three_image: fileNames.ans_three_image,
      ans_four_image: fileNames.ans_four_image,
      question_image: fileNames.question_image,
    })
      .then((data) => {
        return res.status(200).send(successResponse("Question added", 200));
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/:id", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send(errorResponse(400, "Need QuestionID"));
    }
    const questions = await MockQuestions.findAll({
      where: { id: req.params.id },
    });
    let imageName = [
      "ans_one_image",
      "ans_two_image",
      "ans_three_image",
      "ans_four_image",
      "question_image",
    ];
    for (let i = 0; i < 5; i++) {
      if (imageName[i] === "question_image") {
        if (!questions["question_image"]) {
          continue;
        }
        const result = singleImageDelete(
          "question",
          req,
          questions["question_image"]
        );
        if (result.status === 0) {
          return res.status(500).send(errorResponse(500, result.err));
        }
      } else {
        if (!questions[imageName[i]]) {
          continue;
        }
        const result = singleImageDelete(
          "answers",
          req,
          questions[imageName[i]]
        );
        if (result.status === 0) {
          return res.status(500).send(errorResponse(500, result.err));
        }
      }
    }

    MockQuestions.destroy({
      where: {
        id: req.params.id,
      },
    }).then((data) => {
      return res.status(200).send(successResponse("Question deleted", 200));
    });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/updateQuestion", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      Object.keys(req.body).length === 0 &&
      req.body.constructor === Object &&
      !req.body.id
    ) {
      return res.status(400).send(errorResponse(400, "need atleast id"));
    }
    const question = await MockQuestions.findOne({
      where: { id: req.body.id },
    });
    if (!question) {
      return res.status(404).send(errorResponse(404, "Question not found"));
    }
    let imageName = [
      "ans_one_image",
      "ans_two_image",
      "ans_three_image",
      "ans_four_image",
      "question_image",
    ];
    let fileNames = {
      ans_one_image: null,
      ans_two_image: null,
      ans_three_image: null,
      ans_four_image: null,
      question_image: null,
    };

    for (let i = 0; i < 5; i++) {
      if (req.files) {
        const myFile = req.files[imageName[i]];
        if (myFile && imageName[i] === "question_image") {
          const result = singleImageUpdate(
            myFile,
            "question",
            req,
            question["question_image"]
          );
          if (result.status === 0) {
            return res.status(500).send(errorResponse(500, result.err));
          }
          fileNames["question_image"] = result.name;
        } else if (myFile) {
          const result = singleImageUpdate(
            myFile,
            "answers",
            req,
            question[imageName[i]]
          );
          if (result.status === 0) {
            return res.status(500).send(errorResponse(500, result.err));
          }
          fileNames[imageName[i]] = result.name;
        }
      }
    }
    question.updatedBy = req.user.id;

    question.fixSubjectId =
      req.body.fixSubjectId !== "null" || null
        ? req.body.fixSubjectId
        : question.fixSubjectId || question.fixSubjectId;

    question.question =
      req.body.question !== "null" || null
        ? req.body.question
        : req.body.question.length === 0
        ? ""
        : question.ans_one || question.ans_one;

    question.ans_one =
      req.body.ans_one !== "null" || null
        ? req.body.ans_one
        : req.body.ans_one.length === 0
        ? ""
        : question.ans_one || question.ans_one;

    question.ans_two =
      req.body.ans_two !== "null" || null
        ? req.body.ans_two
        : req.body.ans_two.length === 0
        ? ""
        : question.ans_two || question.ans_two;

    question.ans_three =
      req.body.ans_three !== "null" || null
        ? req.body.ans_three
        : req.body.ans_three.length === 0
        ? ""
        : question.ans_three || question.ans_three;

    question.ans_four =
      req.body.ans_four !== "null" || null
        ? req.body.ans_four
        : req.body.ans_four.length === 0
        ? ""
        : question.ans_four || question.ans_four;

    question.question_image =
      fileNames.question_image || question.question_image;

    question.ans_one_image = fileNames.ans_one_image || question.ans_one_image;

    question.ans_two_image = fileNames.ans_two_image || question.ans_two_image;

    question.ans_three_image =
      fileNames.ans_three_image || question.ans_three_image;

    question.ans_four_image =
      fileNames.ans_four_image || question.ans_four_image;

    question.ans_four_status =
      req.body.ans_four_status || question.ans_four_status;
    question.ans_three_status =
      req.body.ans_three_status || question.ans_three_status;
    question.ans_two_status =
      req.body.ans_two_status || question.ans_two_status;
    question.ans_one_status =
      req.body.ans_one_status || question.ans_one_status;
    question.save();
    res.status(200).send(successResponse("Updated", 200));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/deleteImage", authAdmin, checkAdmin, async (req, res) => {
  try {
    const { id, image_field } = req.body;
    const question = await MockQuestions.findOne({ where: { id: id } });
    if (image_field === "question_image" && question[image_field]) {
      const result = singleImageDelete(
        "question",
        req,
        question.question_image
      );
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      question[image_field] = null;
      await question.save();
    } else if (question[image_field]) {
      const result = singleImageDelete("answers", req, question[image_field]);
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      question[image_field] = null;
      await question.save();
    }
    res.status(200).send(successResponse(`${image_field} Image deleted`, 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
