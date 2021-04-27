const bcrpyt = require("bcrypt");
const db = require("../../db");
var User = db.users;
var router = require("express").Router();
const jwt = require("jsonwebtoken");
const errorResponse = require("../../utils/errorResponse");
const authAdmin = require("../../auth/adminAuth");
const checkAdmin = require("../../auth/checkAdmin");
const { Op } = require("sequelize");
const successResponse = require("../../utils/successResponse");

router.post("/", authAdmin, checkAdmin, (req, res) => {
  try {
    let where = {};
    if (req.body.userId) {
      where["id"] = req.body.userId;
    } else {
      where = {
        id: {
          [Op.not]: req.user.id,
        },
        admin: {
          [Op.eq]: true,
        },
      };
    }
    User.findAll({
      attributes: ["id", "username", "email", "createdAt", "updatedAt"],
      where: where,
    }).then((response) => {
      if (!response[0]) {
        return res.status(400).send(errorResponse(200, "User Not found"));
      }
      return res.status(200).send(response);
    });
  } catch (err) {
    return res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.post("/add", authAdmin, checkAdmin, (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !req.body.email ||
      !req.body.password ||
      !req.body.username
    ) {
      res.status(400).send(errorResponse(400, "Need all paramater"));
    }
    if (
      !req.body.email.trim() ||
      !req.body.password.trim() ||
      !req.body.username.trim()
    ) {
      res.status(400).send(errorResponse(400, "Need all paramater"));
    }

    const { email, admin = false } = req.body;

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegexp.test(email)) {
      return res.status(400).send(errorResponse(400, " Need Valid Email"));
    }

    User.findOne({
      where: {
        email: email,
      },
    }).then((response) => {
      if (response) {
        return res.status(400).send(errorResponse(400, "Email Already exist"));
      }
      User.create({
        ...req.body,
        admin: true,
      }).then((resp) => {
        if (admin) {
          return res.status(201).send(successResponse("Admin Created"));
        } else {
          return res.status(201).send(successResponse("User Created"));
        }
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(200)
        .send(errorResponse(400, "need email and password"));
    }

    //finding user in db
    const user = await User.findOne({ where: { email: email } });
    if (!user || !user.admin) {
      return res
        .status(200)
        .send(errorResponse(400, "wrong email id and password"));
    }
    //checking password
    let decodedPassword = await bcrpyt.compare(password, user.password);
    if (!decodedPassword) {
      return res
        .status(200)
        .send(errorResponse(400, "wrong email id and password"));
    }

    //creating token and saving in db
    let token = await jwt.sign({ id: user.id }, process.env.JWT_KEY);
    user.token = token;
    await user.save();

    let modifiedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      admin: user.admin,
      token,
      createdAt: user.createdAt,
    };

    res.cookie("token", token);
    res.status(200).send({ user: modifiedUser });
  } catch (err) {
    console.log(err);
    res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.put("/update", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !req.body.email ||
      !req.body.username ||
      !req.body.id
    ) {
      return res.status(400).send(errorResponse(400, "need id and data"));
    }

    const { id, email, username, password } = req.body;

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegexp.test(email)) {
      return res.status(400).send(errorResponse(400, " Need Valid Email"));
    }

    const user = await User.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res
        .status(400)
        .send(errorResponse(400, "no user found with given id"));
    }

    user.email = email;
    user.username = username;
    if (password && password.length > 0) {
      let newHashPassword = await bcrpyt.hash(password, 8);
      user.password = newHashPassword;
    }
    await user.save();
    return res.status(200).send(successResponse("User Updated !!"));
  } catch (err) {
    res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.delete("/deleteAdmin/:id", authAdmin, checkAdmin, (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send(errorResponse(400, "need id paramater"));
    }
    User.destroy({ where: { id: req.params.id } }).then((response) => {
      res.status(200).send({ rowsAffected: response });
    });
  } catch (err) {
    res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.put("/changePassword", authAdmin, checkAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !req.body.oldPassword ||
      !req.body.newPassword
    ) {
      return res.status(400).send(errorResponse(400, "Need required data"));
    }
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({ where: { id: req.user.id } });

    let decodedPassword = await bcrpyt.compare(oldPassword, req.user.password);
    console.log(decodedPassword);
    if (!decodedPassword) {
      return res.status(400).send(errorResponse(400, "Incorrect Old Password"));
    }
    let newHashPassword = await bcrpyt.hash(newPassword, 8);
    user.password = newHashPassword;
    await user.save();
    res.status(200).send(successResponse("Password Successfully Changed"));
  } catch (err) {
    res.status(500).send(errorResponse(500, err.toString()));
  }
});

module.exports = router;
