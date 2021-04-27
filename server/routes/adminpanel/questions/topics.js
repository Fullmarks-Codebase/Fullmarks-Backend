const router = require("express").Router();
const authAdmin = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const db = require("../../../db");
const { Op } = require("sequelize");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const Topics = db.topics;
const Class = db.class;
const Subject = db.subjects;

router.post("/onlyTopics", async (req, res) => {
  try {
    let where = {};
    if (req.body.subjectId) {
      if (!parseInt(req.body.subjectId)) {
        return res
          .status(400)
          .send(errorResponse(400, "Need Proper Subject ID"));
      }

      where["subjectId"] = req.body.subjectId;

      if (req.body.userId) {
        if (!parseInt(req.body.userId)) {
          return res
            .status(400)
            .send(errorResponse(400, "Need Proper User ID"));
        } else {
          let promises = [];
          const [topics, meta] = await db.sequelize.query(
            "SELECT DISTINCT(topics.id),topics.*,COUNT(questions.id) as total_question from topics LEFT JOIN sets on sets.topicId = topics.id LEFT JOIN questions on questions.topicId = topics.id and questions.setId = sets.id WHERE questions.subjectId = " +
              req.body.subjectId +
              " GROUP by topics.id,questions.topicId,questions.setId HAVING total_question >=10"
          );

          topics.forEach((i, index) => {
            promises.push(getSetCount(i, req.body.userId));
          });
          Promise.all(promises).then((result) => {
            topics.forEach((i, index) => {
              i["completed"] = result[index].toString();
            });
            return res
              .status(200)
              .send(successResponse("Success", 200, topics));
          });
        }
      } else {
        const topics = await Topics.findAll({ where: where });
        return res.status(200).send(successResponse("Success", 200, topics));
      }
    } else {
      return res.status(400).send(errorResponse(400, "Need SubjectId"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

function getSetCount(i, userId) {
  return new Promise(async function (resolve, reject) {
    db.sets
      .count({
        where: {
          subjectId: i.subjectId,
          topicId: i.id,
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
          where: { userId: userId, subjectId: i.subjectId, topicId: i.id },
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

router.get("/getSingleTopic/:id", authAdmin, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(400, "need id"));
    }
    const topic = await Topics.findOne({ where: { id: req.params.id } });
    if (!topic) {
      return res.status(404).send(errorResponse(404, "Topic not found"));
    }
    res.status(200).send(topic);
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/topic/addTopic", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).send(errorResponse(403, "Not Admin"));
    }
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !parseInt(req.body.classId) ||
      !parseInt(req.body.subjectId) ||
      !req.body.name ||
      !req.body.detail
    ) {
      return res.status(400).send(errorResponse(400, "Need name and detail"));
    }
    if (!req.body.name.trim() || !req.body.detail.trim()) {
      return res.status(400).send(errorResponse(400, "Need name and detail"));
    }

    const classes = await Class.findOne({ where: { id: req.body.classId } });
    if (!classes) {
      return res.status(404).send(errorResponse(404, "Class doesnt exist"));
    }
    const subject = await Subject.findOne({
      where: { id: req.body.subjectId },
    });
    if (!subject) {
      return res.status(404).send(errorResponse(404, "Subject doesnt exist"));
    }

    let { name } = req.body;
    const topic = await Topics.findOne({
      where: {
        name: { [Op.like]: name },
        classId: req.body.classId,
        subjectId: req.body.subjectId,
      },
    });

    if (topic) {
      return res.status(400).send(errorResponse(400, "Topic already exists"));
    }

    Topics.create({
      name: name.trim(),
      createdBy: req.user.id,
      updatedBy: req.user.id,
      ...req.body,
    })
      .then(() => {
        return res.status(201).send(successResponse("Topic Added", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/topic/:id", authAdmin, checkAdmin, (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(400, "need id"));
    }
    Topics.destroy({ where: { id: req.params.id } }).then((data) => {
      return res.status(200).send(successResponse("Topic Deleted", 200));
    });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/topic/updateTopic", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !req.body.name ||
      !req.body.detail ||
      !parseInt(req.body.id)
    ) {
      return res.status(400).send(errorResponse(400, "Need name and detail"));
    }
    if (!req.body.name.trim() || !req.body.detail.trim()) {
      return res.status(400).send(errorResponse(400, "Need name and detail"));
    }

    let { id, name, detail } = req.body;
    const topic = await Topics.findOne({ where: { id: id } });
    if (!topic) {
      return res.status(400).send(errorResponse(404, "Doesnt exist"));
    }
    if (topic.name !== name) {
      const checkIfExist = await Topics.findAll({
        where: {
          name: { [Op.like]: name },
          classId: req.body.classId,
          subjectId: req.body.subjectId,
        },
      });
      if (checkIfExist.length > 1) {
        return res.status(400).send(errorResponse(400, "Topic already exists"));
      }
      topic.name = name.trim();
    }
    topic.detail = detail;
    topic.updatedBy = req.user.id;
    await topic.save();
    res.status(200).send(successResponse("Topic Updated", 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
