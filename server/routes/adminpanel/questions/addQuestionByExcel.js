const router = require("express").Router();
const db = require("../../../db");
const auth = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const modifyImageName = require("../../../utils/modifyImageName");
const excelToJson = require("convert-excel-to-json");
var unzipper = require("unzipper");
const fs = require("fs");
const { Op } = require("sequelize");
const Class = db.class;
const Subject = db.subjects;
const Topic = db.topics;
const Set = db.sets;
const Question = db.questions;

const valid = [
  "application/vnd.ms-excel",
  "application/xhtml+xml",
  "font/woff2",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const zipValidation = ["application/zip", "application/x-7z-compressed"];

router.post("/", auth, checkAdmin, async (req, res) => {
  try {
    if (req.files) {
      let promise = [];
      if (req.files.question_image) {
        if (!zipValidation.includes(req.files.question_image.mimetype)) {
          return res
            .status(400)
            .send(errorResponse(400, "Proper Question Zip File Required"));
        }
        const question_zip = req.files.question_image;
        promise.push(
          uploadFile(
            `${process.env.question_image}`,
            `${process.env.AWS_IMAGE_QUESTION}`,
            question_zip,
            req
          )
        );
      }

      if (req.files.answers_image) {
        if (!zipValidation.includes(req.files.answers_image.mimetype)) {
          return res
            .status(400)
            .send(errorResponse(400, "Proper Answer Zip File Required"));
        }
        const answer_zip = req.files.answers_image;
        promise.push(
          uploadFile(
            `${process.env.answers_image}`,
            `${process.env.AWS_IMAGE_ANSWERS}`,
            answer_zip,
            req
          )
        );
      }

      let fix = [
        "question",
        "question_image",
        "ans_one",
        "ans_two",
        "ans_three",
        "ans_four",
        "ans_one_image",
        "ans_two_image",
        "ans_three_image",
        "ans_four_image",
        "difficulty_level",
        "sub_category_name",
        "answer",
        "subject_name",
        "class_name",
      ];
      Promise.all(promise)
        .then(async (result) => {
          if (req.files.questions) {
            if (!valid.includes(req.files.questions.mimetype)) {
              return res
                .status(400)
                .send(errorResponse(400, "Proper Excel Files Required"));
            }
            // console.log(req.files.questions);
            const { Sheet1 } = excelToJson({
              source: req.files.questions.data,
              columnToKey: {
                "*": "{{columnHeader}}",
              },
            });

            const got = Object.keys(Sheet1[0]);
            const result = fix.concat(got).filter((val) => !got.includes(val));

            if (result.length > 0) {
              return res
                .status(400)
                .send(errorResponse(400, `${result} required in excel file`));
            }
            let flag = true;
            for (let row of Sheet1) {
              if (flag === true) {
                flag = false;
                continue;
              }
              await insertData(row, req.user.id, req);
            }
            return res
              .status(200)
              .send(successResponse("File/s Uploaded", 200));
          } else {
            return res
              .status(200)
              .send(successResponse("File/s Uploaded", 200));
          }
        })
        .catch((err) => {
          return res.status(500).send(errorResponse(500, err.toString()));
        });
    } else {
      return res.status(400).send(errorResponse(400, "No File Upload"));
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(errorResponse(500, "=>" + error.toString()));
  }
});

async function uploadFile(path, awsPath, file, req) {
  return new Promise(async function (resolve, reject) {
    try {
      await file.mv(`${path}/${file.name}`);
      if (process.env.NODE_ENV === "production") {
        const s3 = req.app.get("s3");
        fs.createReadStream(`${path}/${file.name}`)
          .pipe(unzipper.Parse())
          .on("entry", async function (entry) {
            const modifiedFileName = entry.path;
            const buffer = await entry.buffer();
            var params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${awsPath}/${modifiedFileName}`,
              Body: buffer,
            };
            try {
              const upload = await s3.upload(params).promise();
            } catch (err) {
              console.log(err);
              throw new Error(err);
            }
          })
          .on("close", function () {
            resolve(1);
          })
          .on("error", function (err) {
            reject(err);
          });
      } else {
        fs.createReadStream(`${path}/${file.name}`).pipe(
          unzipper.Extract({ path: `${path}` })
        );
        resolve(1);
      }
      fs.unlinkSync(`${path}/${file.name}`);
    } catch (err) {
      reject(err);
    }
  });
}

let difficulty_new = {
  Easy: 0,
  easy: 0,
  Medium: 1,
  medium: 1,
  Hard: 2,
  hard: 2,
};

let temp = {
  a: {
    ans_one_status: true,
    ans_two_status: false,
    ans_three_status: false,
    ans_four_status: false,
  },
  b: {
    ans_one_status: false,
    ans_two_status: true,
    ans_three_status: false,
    ans_four_status: false,
  },
  c: {
    ans_one_status: false,
    ans_two_status: false,
    ans_three_status: true,
    ans_four_status: false,
  },
  d: {
    ans_one_status: false,
    ans_two_status: false,
    ans_three_status: false,
    ans_four_status: true,
  },
  A: {
    ans_one_status: true,
    ans_two_status: false,
    ans_three_status: false,
    ans_four_status: false,
  },
  B: {
    ans_one_status: false,
    ans_two_status: true,
    ans_three_status: false,
    ans_four_status: false,
  },
  C: {
    ans_one_status: false,
    ans_two_status: false,
    ans_three_status: true,
    ans_four_status: false,
  },
  D: {
    ans_one_status: false,
    ans_two_status: false,
    ans_three_status: false,
    ans_four_status: true,
  },
};

async function insertData(row, id, req) {
  let ids = {
    class: null,
    subject: null,
    topic: null,
    set: null,
  };
  //class
  let classExist = await Class.findOne({
    where: { name: { [Op.like]: row.class_name } },
  });

  if (!classExist) {
    classExist = await Class.create({
      name: row.class_name,
      createdBy: id,
      updatedBy: id,
      class_image:
        row.class_image && row.class_image.length > 0 ? row.class_image : null,
    });
  }
  ids.class = classExist.id;

  //subject
  let fixSubject = await db.fixSubject.findOne({
    where: { name: { [Op.like]: row.subject_name } },
  });
  if (fixSubject) {
    let subjectExist = await Subject.findOne({
      where: { name: { [Op.like]: fixSubject.name }, classId: ids.class },
    });
    let modifiedFileName = null;
    if (!subjectExist) {
      if (process.env.NODE_ENV === "production") {
        const s3 = req.app.get("s3");
        modifiedFileName = modifyImageName(fixSubject.image);
        s3.getObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.AWS_IMAGE_SUBJECT}/${fixSubject.image}`,
          },
          function (err, data) {
            if (err) {
              console.log(err);
              return res.status(500).send(errorResponse(500, err.toString()));
            }
            var params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${process.env.AWS_IMAGE_SUBJECT}/${modifiedFileName}`,
              Body: data.Body,
            };
            s3.upload(params, function (err, data) {
              if (err) {
                console.log(err);
                return res.status(500).send(errorResponse(500, err.toString()));
              }
            });
          }
        );
      } else {
        var inStr = fs.createReadStream(
          `${process.env.subject_image}/${fixSubject.image}`
        );
        modifiedFileName =
          fixSubject.image.split(".").slice(0, -1).join("") +
          "_" +
          Date.now() +
          "." +
          fixSubject.image.split(".").slice(-1);

        var outStr = fs.createWriteStream(
          `${process.env.subject_image}/${modifiedFileName}`
        );
        inStr.pipe(outStr);
      }

      subjectExist = await Subject.create({
        name: fixSubject.name,
        detail: fixSubject.name,
        createdBy: id,
        updatedBy: id,
        classId: ids.class,
        image: modifiedFileName,
      });
    }
    ids.subject = subjectExist.id;
  } else {
    let subjectExist = await Subject.findOne({
      where: { name: { [Op.like]: row.subject_name }, classId: ids.class },
    });

    if (!subjectExist) {
      subjectExist = await Subject.create({
        name: row.subject_name,
        detail: row.subject_name,
        createdBy: id,
        updatedBy: id,
        classId: ids.class,
        image: null,
      });
    }
    ids.subject = subjectExist.id;
  }

  //topic
  let topicExist = await Topic.findOne({
    where: {
      name: { [Op.like]: row.sub_category_name },
      subjectId: ids.subject,
      classId: ids.class,
    },
  });

  if (!topicExist) {
    topicExist = await Topic.create({
      name: row.sub_category_name,
      detail: row.sub_category_name,
      createdBy: id,
      updatedBy: id,
      classId: ids.class,
      subjectId: ids.subject,
    });
  }

  ids.topic = topicExist.id;

  //set
  const difficulty_level = difficulty_new[row.difficulty_level.toString()];
  // console.log(difficulty_level);
  const ans = temp[row.answer];
  let setExist = await Set.findOne({
    where: { classId: ids.class, topicId: ids.topic, subjectId: ids.subject },
    order: [["id", "DESC"]],
  });
  if (!setExist) {
    setExist = await Set.create({
      name: `Set 1`,
      createdBy: id,
      updatedBy: id,
      classId: ids.class,
      subjectId: ids.subject,
      topicId: ids.topic,
    });
    let question = await Question.create({
      ...row,
      ...ans,
      question: row.question ? row.question + "" : null,
      ans_one: row.ans_one ? row.ans_one + "" : null,
      ans_two: row.ans_two ? row.ans_two + "" : null,
      ans_three: row.ans_three ? row.ans_three + "" : null,
      ans_four: row.ans_four ? row.ans_four + "" : null,
      ans_one_image:
        row.ans_one_image && row.ans_one_image.length > 0
          ? row.ans_one_image
          : null,
      ans_two_image:
        row.ans_two_image && row.ans_two_image.length > 0
          ? row.ans_two_image
          : null,
      ans_three_image:
        row.ans_three_image && row.ans_three_image.length > 0
          ? row.ans_three_image
          : null,
      ans_four_image:
        row.ans_four_image && row.ans_four_image.length > 0
          ? row.ans_four_image
          : null,
      question_image:
        row.question_image && row.question_image.length > 0
          ? row.question_image
          : null,
      difficulty_level: difficulty_level,
      createdBy: id,
      updatedBy: id,
      classId: ids.class,
      subjectId: ids.subject,
      topicId: ids.topic,
      setId: setExist.id,
    });
  } else {
    let setNumber = setExist.name.split(" ")[1];
    const questionInPresendSet = await Question.count({
      where: {
        classId: ids.class,
        subjectId: ids.subject,
        topicId: ids.topic,
        setId: setExist.id,
      },
    });
    if (questionInPresendSet > 9) {
      setExist = await Set.create({
        name: `Set ${parseInt(setNumber) + 1}`,
        createdBy: id,
        updatedBy: id,
        classId: ids.class,
        subjectId: ids.subject,
        topicId: ids.topic,
      });
      let question = await Question.create({
        ...row,
        ...ans,
        question: row.question ? row.question + "" : null,
        ans_one: row.ans_one ? row.ans_one + "" : null,
        ans_two: row.ans_two ? row.ans_two + "" : null,
        ans_three: row.ans_three ? row.ans_three + "" : null,
        ans_four: row.ans_four ? row.ans_four + "" : null,
        ans_one_image:
          row.ans_one_image && row.ans_one_image.length > 0
            ? row.ans_one_image
            : null,
        ans_two_image:
          row.ans_two_image && row.ans_two_image.length > 0
            ? row.ans_two_image
            : null,
        ans_three_image:
          row.ans_three_image && row.ans_three_image.length > 0
            ? row.ans_three_image
            : null,
        ans_four_image:
          row.ans_four_image && row.ans_four_image.length > 0
            ? row.ans_four_image
            : null,
        question_image:
          row.question_image && row.question_image.length > 0
            ? row.question_image
            : null,
        difficulty_level: difficulty_level,
        createdBy: id,
        updatedBy: id,
        classId: ids.class,
        subjectId: ids.subject,
        topicId: ids.topic,
        setId: setExist.id,
      });
    } else {
      let question = await Question.create({
        ...row,
        ...ans,
        question: row.question ? row.question + "" : null,
        ans_one: row.ans_one ? row.ans_one + "" : null,
        ans_two: row.ans_two ? row.ans_two + "" : null,
        ans_three: row.ans_three ? row.ans_three + "" : null,
        ans_four: row.ans_four ? row.ans_four + "" : null,
        ans_one_image:
          row.ans_one_image && row.ans_one_image.length > 0
            ? row.ans_one_image
            : null,
        ans_two_image:
          row.ans_two_image && row.ans_two_image.length > 0
            ? row.ans_two_image
            : null,
        ans_three_image:
          row.ans_three_image && row.ans_three_image.length > 0
            ? row.ans_three_image
            : null,
        ans_four_image:
          row.ans_four_image && row.ans_four_image.length > 0
            ? row.ans_four_image
            : null,
        question_image:
          row.question_image && row.question_image.length > 0
            ? row.question_image
            : null,
        difficulty_level: difficulty_level,
        createdBy: id,
        updatedBy: id,
        classId: ids.class,
        subjectId: ids.subject,
        topicId: ids.topic,
        setId: setExist.id,
      });
    }
  }
}

/* ----------------------- Mock Question Upload ------------------- */

let mandatory = [
  "question",
  "question_image",
  "ans_one",
  "ans_two",
  "ans_three",
  "ans_four",
  "ans_one_image",
  "ans_two_image",
  "ans_three_image",
  "ans_four_image",
  "mock_name",
  "class",
  "answer",
  "subject_name",
];

router.post("/mock", auth, checkAdmin, async (req, res) => {
  try {
    if (req.files) {
      let promise = [];
      if (req.files.question_image) {
        if (!zipValidation.includes(req.files.question_image.mimetype)) {
          return res
            .status(400)
            .send(errorResponse(400, "Proper Question Zip File Required"));
        }
        const question_zip = req.files.question_image;
        promise.push(
          uploadFile(
            `${process.env.question_image}`,
            `${process.env.AWS_IMAGE_QUESTION}`,
            question_zip,
            req
          )
        );
      }

      if (req.files.answers_image) {
        if (!zipValidation.includes(req.files.answers_image.mimetype)) {
          return res
            .status(400)
            .send(errorResponse(400, "Proper Answer Zip File Required"));
        }
        const answer_zip = req.files.answers_image;
        promise.push(
          uploadFile(
            `${process.env.answers_image}`,
            `${process.env.AWS_IMAGE_ANSWERS}`,
            answer_zip,
            req
          )
        );
      }
      let responseToClient;
      let { classId, mockId, fixSubjectId } = req.body;
      // console.log(`classId - ${classId} __ mockId - ${mockId}`);

      //
      Promise.all(promise)
        .then(async () => {
          if (req.files.questions) {
            if (!valid.includes(req.files.questions.mimetype)) {
              return res
                .status(400)
                .send(errorResponse(400, "Proper Excel Files Required"));
            }
            // console.log("Starting to add mock questions");
            const { Sheet1 } = excelToJson({
              source: req.files.questions.data,
              columnToKey: {
                "*": "{{columnHeader}}",
              },
            });
            const got = Object.keys(Sheet1[0]);
            if (classId) {
              mandatory = mandatory.filter((m) => !m.includes("class"));
            }
            if (mockId) {
              mandatory = mandatory.filter((m) => !m.includes("mock_name"));
            }
            if (fixSubjectId) {
              mandatory = mandatory.filter((m) => !m.includes("subject_name"));
            }
            const result = mandatory
              .concat(got)
              .filter((val) => !got.includes(val));
            if (result.length > 0) {
              return res
                .status(400)
                .send(errorResponse(400, `${result} required in excel file`));
            }
            let flag = true;
            for (let row of Sheet1) {
              if (flag === true) {
                flag = false;
                continue;
              }
              responseToClient = await insertMockQuestion(
                res,
                row,
                req.user.id,
                req,
                classId,
                mockId,
                fixSubjectId
              );
            }
            return res
              .status(200)
              .send(successResponse("File/s Uploaded", 200, responseToClient));
          } else {
            return res
              .status(200)
              .send(successResponse("File/s Uploaded", 200, responseToClient));
          }
        })
        .catch((err) => {
          return res.status(500).send(errorResponse(500, err.toString()));
        });
    } else {
      return res.status(400).send(errorResponse(400, "No File Upload"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

async function insertMockQuestion(
  res,
  row,
  userId,
  req,
  classId,
  mockId,
  fixSubjectId
) {
  try {
    let ids = {
      mockId,
      classId,
      fixSubjectId,
    };

    let mockExist;
    let classExist;
    let subjectExist;

    // Class
    if (classId) {
      classExist = await Class.findOne({
        where: {
          id: classId,
        },
      });
    } else {
      classExist = await Class.findOne({
        where: {
          name: {
            [Op.like]: row.class,
          },
        },
      });
    }

    if (!classExist) {
      // if(row.class && row.class.length > 2){
      //   classExist = await Class.create({
      //     name: row.class,
      //     createdBy: 6,
      //     updatedBy: 6,
      //     class_image:
      //       row.class_image && row.class_image.length > 0
      //         ? row.class_image
      //         : null,
      //   })
      // } else {
      // }
    }
    ids.classId = classExist.id;

    // MOCK
    if (mockId) {
      mockExist = await db.mockMaster.findOne({
        where: {
          id: mockId,
        },
      });
    } else {
      mockExist = await db.mockMaster.findOne({
        where: {
          name: {
            [Op.like]: row.mock_name,
          },
        },
      });
      if (!mockExist) {
        let time = {};
        if (row.time) {
          time["time"] = parseInt(row.time);
        }
        if (row.mock_name && row.mock_name.length > 2) {
          mockExist = await db.mockMaster.create({
            name: row.mock_name,
            ...time,
            classId: ids.classId,
          });
        } else {
          throw new Error(
            "Select a Mock OR in the excel-file mock_name must be greater than 2 characters"
          );
        }
      }
    }

    ids.mockId = mockExist.id;

    // SUBJECT

    if (fixSubjectId) {
      subjectExist = await db.fixSubject.findOne({
        where: {
          id: fixSubjectId,
        },
      });
    } else {
      subjectExist = await db.fixSubject.findOne({
        where: {
          name: {
            [Op.like]: row.subject_name,
          },
        },
      });
    }
    if (!subjectExist) {
      throw new Error("Subject Does not exist");
    }
    ids.fixSubjectId = subjectExist.id;

    ids.mockId = mockExist.id;
    const ans = temp[row.answer];
    let question = await db.mockQuestions.create({
      ...ans,
      question: row.question ? row.question + "" : null,
      ans_one: row.ans_one ? row.ans_one + "" : null,
      ans_two: row.ans_two ? row.ans_two + "" : null,
      ans_three: row.ans_three ? row.ans_three + "" : null,
      ans_four: row.ans_four ? row.ans_four + "" : null,
      ans_one_image:
        row.ans_one_image && row.ans_one_image.length > 0
          ? row.ans_one_image
          : null,
      ans_two_image:
        row.ans_two_image && row.ans_two_image.length > 0
          ? row.ans_two_image
          : null,
      ans_three_image:
        row.ans_three_image && row.ans_three_image.length > 0
          ? row.ans_three_image
          : null,
      ans_four_image:
        row.ans_four_image && row.ans_four_image.length > 0
          ? row.ans_four_image
          : null,
      question_image:
        row.question_image && row.question_image.length > 0
          ? row.question_image
          : null,
      createdBy: userId,
      updatedBy: userId,
      classId: ids.classId,
      mockId: ids.mockId,
      fixSubjectId: ids.fixSubjectId,
    });
    return question;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

module.exports = router;
