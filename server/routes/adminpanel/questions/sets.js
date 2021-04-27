const router = require("express").Router();
const { Op } = require("sequelize");
const authAdmin = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const Sets = db.sets;
const Topic = db.topics;

router.post("/", async (req, res) => {
  try {
    if (!parseInt(req.body.topicId)) {
      return res.status(400).send(errorResponse(400, "need proper topicId"));
    }

    let where = {
      topicId: req.body.topicId,
    };
    const topicDetail = await Topic.findOne({
      where: {
        id: req.body.topicId,
      },
    });
    if (!topicDetail) {
      return res.status(400).send(errorResponse(400, "Topic Doesnt Exist"));
    }

    let finalQuery = {
      where: where,
      include: [
        {
          model: db.reportMaster,
          as: "submitted",
          required: false,
          where: {
            classId: topicDetail.classId,
            subjectId: topicDetail.subjectId,
            topicId: req.body.topicId,
            userId: req.body.userId || null,
          },
        },
      ],
      order: [["id", "ASC"]],
    };

    //Set to be shown only if there are 10 questions.. Other if only 6 e.g., don't show the set
    if (req.body.calledFrom === "app") {
      finalQuery.include.push({
        model: db.questions,
        as: "question",
        require: false,
      });
      finalQuery["attributes"] = {
        include: [
          [
            db.Sequelize.fn("COUNT", db.Sequelize.col("question.setId")),
            "questionCount",
          ],
        ],
      };
      finalQuery["group"] = ["sets.id"];
      finalQuery["having"] = db.Sequelize.literal(`count(question.setId) > 9`);
    }

    Sets.findAll(finalQuery)
      .then((result) => {
        result.map((i, index) => {
          if (i.dataValues.submitted.length > 0) {
            i.dataValues.submitted = true;
          } else {
            i.dataValues.submitted = false;
          }
        });
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((error) => {
        return res.status(500).send(errorResponse(500, error.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/add", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      !req.body.name ||
      !parseInt(req.body.subjectId) ||
      !parseInt(req.body.classId) ||
      !parseInt(req.body.topicId)
    ) {
      return res
        .status(400)
        .send(
          errorResponse(
            400,
            "need proper name, subjectId, topicId, classId required"
          )
        );
    }
    if (!req.body.name.trim()) {
      return res.status(400).send(errorResponse(400, "need proper name"));
    }

    const { subjectId, classId, topicId } = req.body;
    const set = await Sets.findOne({
      where: {
        name: { [Op.like]: req.body.name },
        subjectId,
        classId,
        topicId,
      },
    });

    if (set) {
      return res.status(400).send(errorResponse(400, "Already exists"));
    }

    Sets.create({
      ...req.body,
      name: req.body.name.trim(),
      createdBy: req.user.id,
      updatedBy: req.user.id,
    })
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/:id", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(500, "need proper id params"));
    }

    const set = await Sets.findOne({
      where: { id: req.params.id },
    });

    let allSet = [];
    if (!set) {
      return res.status(400).send(errorResponse(400, "Set Doesnt Exist"));
    }

    Sets.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then(async (result) => {
        let promisis = [];
        allSet = await Sets.findAll({
          where: {
            name: {
              [Op.like]: "%Set %",
            },
            subjectId: set.subjectId,
            topicId: set.topicId,
            classId: set.classId,
          },
        });

        if (allSet.length > 0) {
          if (parseInt(allSet[0].dataValues.name.split(" ")[1]) !== 1) {
            for (var i = 0; i < allSet.length; i++) {
              allSet[i].dataValues.name = "Set " + parseInt(i + 1);
              promisis.push(saveData(allSet[i], "Set " + parseInt(1 + i)));
            }
          } else {
            for (var i = 1; i < allSet.length; i++) {
              if (
                parseInt(allSet[i - 1].dataValues.name.split(" ")[1]) + 1 !==
                parseInt(allSet[i].dataValues.name.split(" ")[1])
              ) {
                allSet[i].dataValues.name =
                  "Set " +
                  parseInt(
                    parseInt(allSet[i - 1].dataValues.name.split(" ")[1]) + 1
                  );
                promisis.push(
                  saveData(
                    allSet[i],
                    "Set " +
                      parseInt(
                        parseInt(allSet[i - 1].dataValues.name.split(" ")[1]) +
                          1
                      )
                  )
                );
              }
            }
          }
        }

        Promise.all(promisis)
          .then((result) => {
            return res
              .status(200)
              .send(successResponse("Set Deleted", 200, result));
          })
          .catch((err) => {
            return res.status(500).send(errorResponse(500, err.toString()));
          });
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

function saveData(data, name) {
  return new Promise(async function (resolve, reject) {
    console.log(data.dataValues);
    Sets.update({ name: name }, { where: { id: data.id } })
      .then(() => {
        resolve(1);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

router.put("/update", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.body.id) || !req.body.name) {
      return res.status(400).send(errorResponse(400, "Need Name and setId"));
    }
    if (!req.body.name.trim()) {
      return res.status(400).send(errorResponse(400, "Need Name and setId"));
    }

    const set = await Sets.findOne({ where: { id: req.body.id } });
    if (!set) {
      return res.status(400).send(errorResponse(400, "Set doesnt exist"));
    }
    Sets.update(
      { ...req.body, updatedBy: req.user.id },
      {
        where: {
          id: req.body.id,
        },
      }
    )
      .then((result) => {
        return res.status(200).send(successResponse("Set Updated", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

// router.post("/", authAdmin, (req, res) => {
//   try {
//     if (!req.body.topicId || !req.body.subjectId) {
//       return res
//         .status(400)
//         .send(errorResponse(400, "Need at least topicId and SubjectId"));
//     }
//     let where = {
//       topicId: req.body.topicId,
//       subjectId: req.body.subjectId,
//     };
//     Questions.findAll({ where: where })
//       .then((result) => {
//         let sets = {};
//         for (let i = 0; i < Math.ceil(result.length / 10); i++) {
//           sets[`Set`] = i;
//         }
//         res.send(successResponse('Success',200,sets));
//       })
//       .catch((err) => {
//         res.status(500).status(errorResponse(500,err.toString()))
//       });
//   } catch (error) {
//     return res.status(500).send(errorResponse(500, error.toString()));
//   }
// });

// router.post("/questions", authAdmin, (req, res) => {
//   try {
//     if (!req.body.topicId || !req.body.subjectId || !req.body.setNumber) {
//       return res
//         .status(400)
//         .send(errorResponse(400, "Need topicId, SubjectId, setNumber"));
//     }
//     let where = {
//       topicId: req.body.topicId,
//       subjectId: req.body.subjectId,
//     };
//     const { setNumber } = req.body;
//     console.log(typeof setNumber);
//     Questions.findAll({ where: where })
//       .then((result) => {
//         let sets = [];
//         for (let i = 0; i < Math.ceil(result.length / 10); i++) {
//           if (i === parseInt(setNumber)) {
//             for (let j = i * 10; j < i * 10 + 10; j++) {
//               if (result[j]) sets.push(result[j]);
//             }
//           }
//         }
//         res.status(200).send(successResponse('Success',200,sets));
//       })
//       .catch((err) => {
//         res.status(500).status(errorResponse(500,err.toString()))
//       });
//   } catch (error) {
//     return res.status(500).send(errorResponse(500, error.toString()));
//   }
// });

module.exports = router;
