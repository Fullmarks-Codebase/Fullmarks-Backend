const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const covertImageName = require("../../../utils/modifyImageName");
const router = require("express").Router();
const randomRoom = require("../../../utils/randomOtp");
const auth = require("../../../auth/adminAuth");
const CustomerLiveQuizQuestions = db.customerLiveQuizQuestions;
const CustomerLiveQuiz = db.customerLiveQuiz;
const CustomQuestionsMaster = db.customQuestionsMaster;
const CustomQuestions = db.customQuestions;
const fs = require("fs");
const { Op } = require("sequelize");
const {
  singleImageAdd,
  singleImageDelete,
  singleImageUpdate,
} = require("../../../utils/ImageUtils");

/* ---------------- User Personal Quiz Master---------------- */

router.post("/getNames", auth, (req, res) => {
  try {
    CustomQuestionsMaster.findAll({
      where: { userId: req.user.id, classId: req.user.class },
      include: [
        {
          model: db.customQuestions,
          as: "questions",
          attributes: [],
          required: false,
        },
        {
          model: db.liveQuizReportMasters,
          as: "customMaster",
          required: false,
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.literal(" IF(count(customMaster.id) > 0, 1, 0)"),
            "submitted",
          ],
        ],
      },
      // order: [["id", "DESC"]],
      group: ["id"],
    })
      .then(async (result) => {
        for (let set of result) {
          let questionCount = await db.customQuestions.count({
            where: { customMasterId: set.id },
          });
          try {
            set.dataValues["total_question"] = questionCount || 0;
          } catch (err) {
            set["total_question"] = questionCount || 0;
          }
        }
        res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((error) => {
        res.status(500).send(errorResponse(500, error.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send(errorResponse(400, "name (quiz name)"));
    }
    if (!req.body.name.trim())
      return res.status(400).send(errorResponse(400, "name (quiz name)"));

    const name = req.body.name.trim();
    const validation = await CustomQuestionsMaster.findOne({
      where: {
        name: { [Op.like]: name },
        userId: req.user.id,
        classId: req.user.class || 4,
      },
    });
    if (validation) {
      return res.status(500).send(errorResponse(500, "Name Already Exist"));
    }

    CustomQuestionsMaster.create({
      name: name.trim(),
      createdBy: req.user.id,
      userId: req.user.id,
      classId: req.user.class,
    })
      .then((result) => {
        res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(400, "need quizID"));
    }
    const customer = await CustomQuestionsMaster.findOne({
      where: { userId: req.user.id, id: req.params.id },
    });

    if (!customer) {
      return res
        .status(400)
        .send(errorResponse(400, "You can not delete quiz of others"));
    }

    CustomQuestionsMaster.destroy({ where: { id: req.params.id } }).then(
      (result) => {
        res.status(200).send(successResponse("Quiz Deleted", 200));
      }
    );
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.id) || !req.body.name) {
      return res.status(400).send(errorResponse(400, "Need quizID"));
    }
    if (req.body.name.trim().length < 1) {
      return res.status(400).send(errorResponse(400, "Need Name"));
    }
    const { name } = req.body;
    CustomQuestionsMaster.update(
      { name: name.trim() },
      { where: { id: req.body.id } }
    )
      .then((result) => {
        return res.status(200).send(successResponse("Name Updated", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

/* ------------------- Custom Question ----------------- */

router.post("/getQuestions", auth, (req, res) => {
  try {
    if (!parseInt(req.body.customMasterId)) {
      return res.status(400).send(errorResponse(400, "Need customMasterId"));
    }
    CustomQuestions.findAll({
      where: { customMasterId: req.body.customMasterId, userId: req.user.id },
      order: [["id", "DESC"]],
    })
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

const mandatory = [
  // "time",
  "customMasterId",
  "ans_one_status",
  "ans_two_status",
  "ans_three_status",
  "ans_four_status",
];

router.post("/questions/add", auth, async (req, res) => {
  try {
    if (!req.body.customMasterId) {
      return res.status(400).send(errorResponse(400, "Need CustomMasterId"));
    }
    let difference = mandatory.filter(
      (x) => !Object.keys(req.body).includes(x)
    );

    if (difference.length > 0) {
      return res.status(400).send(errorResponse(400, "Need Data"));
    }

    const { ans_one, ans_two, ans_three, ans_four, question } = req.body;

    const questionContent = JSON.parse(question);
    const ansOneContent = JSON.parse(ans_one);
    const ansTwoContent = JSON.parse(ans_two);
    const ansThreeContent = JSON.parse(ans_three);
    const ansFourContent = JSON.parse(ans_four);

    let contents = [
      ansOneContent,
      ansTwoContent,
      ansThreeContent,
      ansFourContent,
      questionContent,
    ];

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
    if (req.files) {
      if (Object.keys(req.files).length > 0) {
        var imageKeyNames = Object.keys(req.files);
        contents.map((content, index) => {
          imageKeyNames.map((i) => {
            const image = req.files[i];
            content.map((tag) => {
              if (
                tag.attributes &&
                tag.attributes.embed &&
                tag.attributes.embed.source &&
                tag.attributes.embed.type === "image" &&
                tag.attributes.embed.source.split("/").pop() === image.name
              ) {
                if (index === 4) {
                  const result = singleImageAdd(image, "custom_question", req);
                  if (result.status === 0) {
                    return res.status(500).send(errorResponse(500, result.err));
                  }
                  tag.attributes.embed.source = `${result.name}`;
                  fileNames[imageName[index]] = result.name;
                } else {
                  const result = singleImageAdd(image, "custom_answers", req);
                  if (result.status === 0) {
                    return res.status(500).send(errorResponse(500, result.err));
                  }
                  tag.attributes.embed.source = `${result.name}`;
                  fileNames[imageName[index]] = result.name;
                }
              }
            });
          });
        });
      }
    }

    const set = await CustomQuestionsMaster.findOne({
      where: { id: req.body.customMasterId },
    });
    if (!set) {
      return res.status(400).send(errorResponse(400, "Set doesnt exist"));
    }

    CustomQuestions.create({
      ...req.body,
      userId: req.user.id,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ans_one: JSON.stringify(ansOneContent),
      ans_two: JSON.stringify(ansTwoContent),
      ans_three: JSON.stringify(ansThreeContent),
      ans_four: JSON.stringify(ansFourContent),
      question: JSON.stringify(questionContent),
    })
      .then((data) => {
        return res
          .status(200)
          .send(successResponse("Question added", 200, data));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/questions/:id", auth, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(400, "Need Question ID"));
    }
    const questions = await CustomQuestions.findOne({
      where: { id: req.params.id },
    });
    if (!questions) {
      return res.status(400).send(errorResponse(400, "Question doesnt exist"));
    }
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
        const oldImage = `${process.env.custom_question}/${questions["question_image"]}`;
        if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      } else {
        if (!questions[imageName[i]]) {
          continue;
        }
        const oldImage = `${process.env.custom_answers}/${
          questions[imageName[i]]
        }`;
        if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      }
    }

    CustomQuestions.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((data) => {
        return res.status(200).send(successResponse("Question deleted", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/questions/update", auth, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !parseInt(req.body.id)
    ) {
      return res.status(400).send(errorResponse(400, "Need QuestionId"));
    }

    const questiondb = await CustomQuestions.findOne({
      where: { id: req.body.id },
    });

    if (!questiondb) {
      return res.status(400).send(errorResponse(400, "Question not found"));
    }

    let { ans_one, ans_two, ans_three, ans_four, question } = req.body;

    // Function to delete Images in answers
    let deleteImageIfExists = (imageNames, content) => {
      imageNames.map((image) => {
        content.map((tag) => {
          if (
            tag.attributes &&
            tag.attributes.embed &&
            tag.attributes.embed.source &&
            tag.attributes.embed.type === "image" &&
            tag.attributes.embed.source.split("/").pop() === image
          ) {
            singleImageDelete("custom_answers", req, image);
          }
        });
      });
    };

    // Check to delete images
    if (req.body.deleteImages) {
      const imageNames = req.body.deleteImages
        .replace(new RegExp('"', "g"), "")
        .replace("[", "")
        .replace("]", "")
        .split(",");

      if (ans_one) {
        let ansOneContent = JSON.parse(ans_one);
        deleteImageIfExists(imageNames, ansOneContent);
      }
      if (ans_two) {
        let ansTwoContent = JSON.parse(ans_two);
        deleteImageIfExists(imageNames, ansTwoContent);
      }
      if (ans_three) {
        let ansThreeContent = JSON.parse(ans_three);
        deleteImageIfExists(imageNames, ansThreeContent);
      }
      if (ans_four) {
        let ansFourContent = JSON.parse(ans_four);
        deleteImageIfExists(imageNames, ansFourContent);
      }
      if (question) {
        let questionContent = JSON.parse(question);
        imageNames.map((image) => {
          questionContent.map((tag) => {
            if (
              tag.attributes &&
              tag.attributes.embed &&
              tag.attributes.embed.source &&
              tag.attributes.embed.type === "image" &&
              tag.attributes.embed.source.split("/").pop() === image
            ) {
              singleImageDelete("custom_question", req, image);
            }
          });
        });
      }
    }

    // Add image if exists

    const addImageIfExistsAnswers = (image, content) => {
      content.map((tag) => {
        if (
          tag.attributes &&
          tag.attributes.embed &&
          tag.attributes.embed.source &&
          tag.attributes.embed.type === "image" &&
          tag.attributes.embed.source.split("/").pop() === image.name
        ) {
          const result = singleImageAdd(image, "custom_answers", req);
          if (result.status === 0) {
            return res.status(500).send(errorResponse(500, result.err));
          }
          tag.attributes.embed.source = `${result.name}`;
        }
      });
    };

    if (req.files) {
      if (Object.keys(req.files).length > 0) {
        var imageKeyNames = Object.keys(req.files);
        imageKeyNames.map((i) => {
          const image = req.files[i];
          if (ans_one) {
            let ansOneContent = JSON.parse(ans_one);
            addImageIfExistsAnswers(image, ansOneContent);
          }
          if (ans_two) {
            let ansTwoContent = JSON.parse(ans_two);
            addImageIfExistsAnswers(image, ansTwoContent);
          }
          if (ans_three) {
            let ansThreeContent = JSON.parse(ans_three);
            addImageIfExistsAnswers(image, ansThreeContent);
          }
          if (ans_four) {
            let ansFourContent = JSON.parse(ans_four);
            addImageIfExistsAnswers(image, ansFourContent);
          }
          if (question) {
            let questionContent = JSON.parse(question);
            questionContent.map((tag) => {
              if (
                tag.attributes &&
                tag.attributes.embed &&
                tag.attributes.embed.source &&
                tag.attributes.embed.type === "image" &&
                tag.attributes.embed.source.split("/").pop() === image.name
              ) {
                const result = singleImageAdd(image, "custom_answers", req);
                if (result.status === 0) {
                  return res.status(500).send(errorResponse(500, result.err));
                }
                tag.attributes.embed.source = `${result.name}`;
              }
            });
          }
        });
      }
    }

    CustomQuestions.update(
      {
        ...req.body,

        ans_one: ans_one || questiondb["ans_one"],
        ans_two: ans_two || questiondb["ans_two"],
        ans_three: ans_three || questiondb["ans_three"],
        ans_four: ans_four || questiondb["ans_four"],
        question: question || questiondb["question"],
      },
      {
        where: {
          id: req.body.id,
        },
      }
    )
      .then(async (result) => {
        const question = await CustomQuestions.findOne({
          where: { id: req.body.id },
        });
        return res.status(200).send(successResponse("Updated", 200, question));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/deleteImage", auth, async (req, res) => {
  try {
    const { id, image_field } = req.body;
    const question = await CustomQuestions.findOne({ where: { id: id } });
    if (image_field === "question_image" && question[image_field]) {
      const result = singleImageDelete(
        "custom_question",
        req,
        question.question_image
      );
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      question[image_field] = null;
      await question.save();
    } else if (question[image_field]) {
      const result = singleImageDelete(
        "custom_answers",
        req,
        question[image_field]
      );
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

/* -------------------- Random Live Quiz ------------------- */

router.post("/getQuestions/random", auth, async (req, res) => {
  try {
    if (!req.body.customMasterId) {
      return res.status(400).send(errorResponse(400, "need customMasterId"));
    }
    const randomRoomId = randomRoom();
    // const [questions, metaQuestions] = await db.sequelize.query(
    //   `select * from custom_questions where customMasterId='${req.body.customMasterId}'`
    // );
    const questions = await db.customQuestions.findAll({
      where: {
        customMasterId: req.body.customMasterId,
      },
    });

    const customer_live = await CustomerLiveQuiz.create({
      userId: req.user.id,
      room: randomRoomId,
    });

    let questionsRef = [];
    for (let i = 0; i < questions.length; i++) {
      let temp = {};
      temp["userRoomId"] = customer_live.id;
      temp["customQuestionId"] = questions[i].id;
      questionsRef.push(temp);
    }

    CustomerLiveQuizQuestions.bulkCreate(questionsRef)
      .then((result) => {
        res.status(200).send(
          successResponse("Success", 200, {
            room: customer_live,
            questions: questions,
          })
        );
      })
      .catch((err) => {
        res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
