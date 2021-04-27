const router = require("express").Router();
const fs = require("fs");
const authAdmin = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const db = require("../../../db");
const { Op } = require("sequelize");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const modifyImageName = require("../../../utils/modifyImageName");
const Subjects = db.subjects;
const Class = db.class;
const FixSubject = db.fixSubject;
const {
  singleImageAdd,
  singleImageDelete,
  singleImageUpdate,
} = require("../../../utils/ImageUtils");

//////////////////   Subject   ////////////////////

// get all subjects or getByid (para:id)
router.post("/onlySubjects", async (req, res) => {
  try {
    if (req.body.subjectId) {
      if (parseInt(req.body.subjectId)) {
        const subjects = await Subjects.findOne({
          where: { id: req.body.subjectId },
        });
        if (!subjects) {
          return res.status(404).send(errorResponse(404, "Subject Not found"));
        }
        return res.send(successResponse("Success", 200, subjects));
      } else {
        return res.status(400).send(errorResponse(400, "Need SubjectId"));
      }
    }

    if (req.body.classId) {
      if (req.body.classId) {
        const classes = await Class.findOne({
          where: { id: req.body.classId },
        });
        if (!classes) {
          return res.status(404).send(errorResponse(404, "Class Not found"));
        }
      } else {
        return res.status(400).send(errorResponse(400, "Need ClassId"));
      }
    }

    if (req.body.guest) {
      if (req.body.guest === "true") {
        if (!parseInt(req.body.guestId)) {
          return res.status(400).send(errorResponse(400, "Need GuestID"));
        }
        const guestCheck = await db.guest.findOne({
          where: { id: req.body.guestId },
        });
        if (!guestCheck) {
          return res.status(400).send(errorResponse(400, "Guest not found"));
        }

        const classes = await Class.findOne({
          where: { id: guestCheck.class },
        });
        if (!classes) {
          return res.status(500).send(errorResponse(500, "No Class found"));
        }

        let [subjects, meta] = await db.sequelize.query(
          "SELECT DISTINCT(subjects.id),subjects.*,COUNT(questions.id) as total_question from subjects LEFT JOIN topics on topics.subjectId = subjects.id LEFT JOIN sets on sets.topicId = topics.id and sets.subjectId = topics.subjectId LEFT JOIN questions on questions.subjectId = subjects.id and questions.topicId = topics.id and questions.setId = sets.id WHERE questions.classId = " +
            classes.id +
            " GROUP by subjects.id,questions.topicId,questions.setId HAVING total_question >=10"
        );

        subjects.map((i, index) => {
          i["completed"] = null;
        });

        return res.send(successResponse("Success", 200, subjects));
      }
    }

    if (req.body.id) {
      if (!parseInt(req.body.id)) {
        return res.status(400).send(errorResponse(400, "Need ClassId"));
      }
      let promises = [];
      if (req.body.userId) {
        if (!parseInt(req.body.userId)) {
          return res.status(400).send(errorResponse(400, "Need Valid UserId"));
        }
        const [sub, submeta] = await db.sequelize.query(
          "SELECT DISTINCT(subjects.id),subjects.*,COUNT(questions.id) as total_question from subjects LEFT JOIN topics on topics.subjectId = subjects.id LEFT JOIN sets on sets.topicId = topics.id and sets.subjectId = topics.subjectId LEFT JOIN questions on questions.subjectId = subjects.id and questions.topicId = topics.id and questions.setId = sets.id WHERE questions.classId = " +
            req.body.id +
            " GROUP by subjects.id,questions.topicId,questions.setId HAVING total_question >=10"
        );

        sub.forEach((i, index) => {
          promises.push(getSetCount(i, req.body.userId));
        });

        Promise.all(promises)
          .then((result) => {
            sub.forEach((i, index) => {
              i["completed"] = result[index].toString();
            });
            return res.status(200).send(successResponse("Success", 200, sub));
          })
          .catch((err) => {
            return res.status(500).send(errorResponse(500, err.toString()));
          });
      } else {
        const result = await db.subjects.findAll({
          where: {
            classId: req.body.id,
          },
        });
        return res.status(200).send(successResponse("Success", 200, result));
      }
    } else {
      return res.status(400).send(errorResponse(400, "Need ClassId"));
    }
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

function getSetCount(i, userId) {
  return new Promise(async function (resolve, reject) {
    db.sets
      .count({
        where: {
          subjectId: i.id,
        },
        include: [
          {
            model: db.questions,
            as: "question",
            require: false,
          },
        ],
        group: ["sets.id"],
        having: db.Sequelize.literal(`count(question.id) > 9`),
      })
      .then(async (result) => {
        const userCompleted = await db.reportMaster.count({
          where: { userId: userId, subjectId: i.id },
        });
        if (result.length > 0) {
          const percent = ((userCompleted * 100) / result.length).toFixed(2);
          resolve(percent);
        } else {
          resolve(0);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

router.delete("/:id", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(500).send(errorResponse(500, "need id"));
    }
    const subject = await Subjects.findOne({ where: { id: req.params.id } });
    const result = singleImageDelete("subjects", req, subject.image);
    if (result.status === 0) {
      return res.status(500).send(errorResponse(500, result.err.toString()));
    }
    Subjects.destroy({ where: { id: req.params.id } }).then((response) => {
      return res.status(200).send(successResponse("Subject Deleted", 200));
    });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/addSubject", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !parseInt(req.body.classId) ||
      !req.body.name
    ) {
      return res.status(400).send(errorResponse(400, "Need all parameter"));
    }

    if (!req.body.name.trim()) {
      return res.status(400).send(errorResponse(400, "Need all parameter"));
    }

    const classes = await Class.findOne({ where: { id: req.body.classId } });

    if (!classes) {
      return res.status(404).send(errorResponse(404, "Class doesnt exist"));
    }

    let { name, detail } = req.body;
    const sub = await Subjects.findOne({
      where: { name: { [Op.like]: name }, classId: req.body.classId },
    });

    if (sub) {
      return res.status(400).send(errorResponse(400, "Subject already exists"));
    }

    let modifiedFileName = null;
    if (req.files) {
      if (req.files.image) {
        const myFile = req.files.image;
        const result = singleImageAdd(myFile, "subjects", req);
        if (result.status === 0) {
          return res.status(500).send(errorResponse(500, result.err));
        }
        modifiedFileName = result.name;
      }
    } else {
      const fixSubject = await db.fixSubject.findOne({
        where: { name: name },
      });

      if (process.env.NODE_ENV === "production") {
        const s3 = req.app.get("s3");
        const newName = modifyImageName(fixSubject.image);
        s3.getObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.AWS_IMAGE_SUBJECT}/${fixSubject.image}`,
          },
          function (err, data) {
            if (err)
              return res.status(500).send(errorResponse(500, err.toString()));
            var params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${process.env.AWS_IMAGE_SUBJECT}/${newName}`,
              Body: data.Body,
            };
            s3.upload(params, function (err, data) {
              if (err)
                return res.status(500).send(errorResponse(500, err.toString()));
            });
          }
        );

        modifiedFileName = newName;
      } else {
        if (fixSubject && req.body.file_name && req.body.file_name.trim()) {
          var inStr = fs.createReadStream(
            `${process.env.subject_image}/${req.body.file_name}`
          );
          modifiedFileName =
            req.body.file_name.split(".").slice(0, -1).join("") +
            "_" +
            Date.now() +
            "." +
            req.body.file_name.split(".").slice(-1);

          var outStr = fs.createWriteStream(
            `${process.env.subject_image}/${modifiedFileName}`
          );
          inStr.pipe(outStr);
        }
      }
    }

    Subjects.create({
      name: name.trim(),
      detail: detail || name.trim(),
      image: modifiedFileName || null,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      classId: req.body.classId,
    }).then(() => {
      return res.status(201).send(successResponse("Subject Added", 201));
    });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/updateSubject", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !parseInt(req.body.id) ||
      !req.body.name
    ) {
      return res.status(400).send(errorResponse(400, "Need all paramater"));
    }
    if (!req.body.name.trim()) {
      return res.status(400).send(errorResponse(400, "Need all paramater"));
    }

    let { id, name, detail } = req.body;
    const sub = await Subjects.findOne({ where: { id: id } });

    if (!sub) {
      return res.status(404).send(errorResponse(404, "Subject doesnt exist"));
    }

    if (sub.name !== name) {
      const checkIfExist = await Subjects.findAll({ where: { name: name } });
      if (checkIfExist.length > 1) {
        return res
          .status(400)
          .send(errorResponse(400, "Subject name already exists"));
      }
      sub.name = name.trim();
    }
    sub.detail = detail;
    sub.updatedBy = req.user.id;
    if (req.files) {
      const myFile = req.files.image;
      const result = singleImageUpdate(myFile, "subjects", req, sub.image);
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      sub.image = result.name;
    }
    await sub.save();
    return res.status(200).send(successResponse("Subject Updated", 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/deleteImage", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.body.id)) {
      return res.status(400).send(errorResponse("Need Proper Id"));
    }
    const { id, image_field } = req.body;
    const sub = await Subjects.findOne({ where: { id: id } });
    if (sub[image_field]) {
      const result = singleImageDelete("subjects", req, sub.image);
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      sub[image_field] = null;
      await sub.save();
    }
    res.status(200).send(successResponse(`${image_field} Image deleted`, 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.get("/fixSubject", authAdmin, checkAdmin, (req, res) => {
  try {
    FixSubject.findAll({})
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
