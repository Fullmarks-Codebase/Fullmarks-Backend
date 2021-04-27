const router = require("express").Router();
const auth = require("../../../auth/adminAuth");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const MockMaster = db.mockMaster;
const MockQuestions = db.mockQuestions;

// router.post("/", auth, (req, res) => {
//   try {
//     MockMaster.findAll({}).then((result) => {
//       return res.status(200).send(successResponse("Success",200,result));
//     });
//   } catch (error) {
//     res.status(500).send(errorResponse(500, error.toString()));
//   }
// });

router.post("/questions", auth, (req, res) => {
  try {
    if (!req.body.mockId) {
      return res.status(400).send(errorResponse(400, "need mockid"));
    }
    MockQuestions.findAll({
      where: {
        mockId: req.body.mockId,
      },
    })
      .then((result) => {
        return res.status(200).send(successResponse("Success",200,result));
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
