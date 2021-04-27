const router = require("express").Router();
const auth = require("../../../auth/adminAuth");
const checkAdmin = require("../../../auth/checkAdmin");
const db = require("../../../db");
const { Op } = require("sequelize");
const errorResponse = require("../../../utils/errorResponse");
const modifyImageName = require("../../../utils/modifyImageName");
const successResponse = require("../../../utils/successResponse");
const Class = db.class;
const {
  singleImageAdd,
  singleImageDelete,
  singleImageUpdate,
} = require("../../../utils/ImageUtils");

router.post("/", (req, res) => {
  try {
    let where = {};
    if (parseInt(req.body.id)) {
      where["id"] = req.body.id;
    }
    Class.findAll({ where: where })
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

router.post("/add", auth, checkAdmin, async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send(errorResponse(400, "Need name"));
    }
    if (req.body.name.trim() < 1) {
      return res.status(400).send(errorResponse(400, "Need name"));
    }

    const classes = await Class.findOne({
      where: {
        name: {
          [Op.like]: req.body.name,
        },
      },
    });

    if (classes) {
      return res.status(400).send(errorResponse(400, "Already Exist"));
    }

    let modifiedFileName = null;
    if (req.files) {
      const myFile = req.files.class_image;
      const result = singleImageAdd(myFile, "class", req);
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      modifiedFileName = result.name;
    }
    Class.create({
      ...req.body,
      name: req.body.name.trim(),
      class_image: modifiedFileName,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    })
      .then((result) => {
        res.status(200).send(successResponse("Class Added", 200));
      })
      .catch((err) => {
        res.status(500).send(errorResponse(500, error.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/:id", auth, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res
        .status(400)
        .send(errorResponse(400, "Need proper id of class"));
    }
    const classes = await Class.findOne({ where: { id: req.params.id } });
    if (!classes) {
      return res
        .status(400)
        .send(errorResponse(400, "Class doesnt exist anymore"));
    }
    const result = singleImageDelete("class", req, classes.class_image);
    if (result.status === 0) {
      return res.status(500).send(errorResponse(500, result.err));
    }
    Class.destroy({ where: { id: req.params.id } })
      .then(() => {
        return res.status(200).send(successResponse("Class deleted", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/update", auth, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.body.id)) {
      return res.status(400).send(errorResponse(400, "Need proper class id"));
    }
    if (!req.body.name) {
      return res.status(400).send(errorResponse(400, "Need proper class name"));
    }
    const classes = await Class.findOne({ where: { id: req.body.id } });

    if (!classes) {
      return res.status(404).send(errorResponse(404, "Class doesnt exist"));
    }

    const checkIfExist = await Class.findAll({
      where: {
        name: {
          [Op.like]: req.body.name,
        },
      },
    });

    if (checkIfExist.length > 1) {
      return res.status(400).send(errorResponse(400, "Already Exist"));
    }

    if (req.files) {
      if (req.files.class_image) {
        const myFile = req.files.class_image;
        const result = singleImageUpdate(
          myFile,
          "class",
          req,
          classes.class_image
        );
        if (result.status === 0) {
          return res.status(500).send(errorResponse(500, result.err));
        }
        classes.class_image = result.name || classes.class_image;
      }
    }
    classes.name = req.body.name.trim();
    classes.updatedBy = req.user.id;
    await classes.save();
    return res.status(200).send(successResponse("Class Updated", 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/deleteImage", auth, checkAdmin, async (req, res) => {
  try {
    if (!parseInt(req.body.id)) {
      return res.status(400).send(errorResponse(400, "Need proper Id"));
    }
    const { id, class_image } = req.body;

    const classes = await Class.findOne({ where: { id: id } });

    if (classes[class_image]) {
      const result = singleImageDelete("class", req, classes.class_image);
      if (result.status === 0) {
        return res.status(500).send(errorResponse(500, result.err));
      }
      classes[class_image] = null;
      await classes.save();
    }
    res.status(200).send(successResponse(`Image deleted`, 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
