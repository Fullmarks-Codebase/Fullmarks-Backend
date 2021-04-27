var router = require("express").Router();
const jwt = require("jsonwebtoken");
const errorResponse = require("../../utils/errorResponse");
const db = require("../../db");
var User = db.users;
const nodemailer = require("nodemailer");
const successResposne = require("../../utils/successResponse");
const bcrypt = require("bcrypt");

// router.get("/",(req,res)=>{
//   res.render('react-main',{title:"Full",type:'page'})
// })

router.post("/forgotPassword", async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).send(errorResponse(400, "Need Email"));
    }
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegexp.test(req.body.email)) {
      return res.status(400).send(errorResponse(400, " Need Valid Email"));
    }

    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(400).send(errorResponse(400, "No email found"));
    }

    let resetPasswordToken = await jwt.sign(
      { email: user.email },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60, // 1hour
      }
    );
    let transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASS,
      },
    });
    const message = {
      from: "fullmarks@fullmarks.com", // Sender address
      to: req.body.email, // List of recipients
      subject: "Forgot password link", // Subject line
      text: "link:", // Plain text body
      html: `<html><body><h1>${process.env.REACT_APP_URL}/auth/NewPassword/${resetPasswordToken}</h1></body></html>`,
    };
    transport.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    user.resetPasswordToken = resetPasswordToken;
    await user.save();

    res
      .status(200)
      .send(
        successResposne(
          "Link has been sent to given email, please check in your inbox."
        )
      );
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/checkResetPasswordToken", async (req, res) => {
  try {
    if (!req.body.token) {
      return res.status(400).send(errorResponse(400, "Need token"));
    }
    if (!req.body.token.trim()) {
      return res.status(400).send(errorResponse(400, "Need token"));
    }
    const user = await User.findOne({
      where: { resetPasswordToken: req.body.token },
    });

    if (!user) {
      return res.status(400).send(errorResponse(400, "invalid token"));
    }
    jwt.verify(req.body.token, process.env.JWT_KEY);
    res.status(200).send(successResposne("token-valid-200"));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/updateNewPassword", async (req, res) => {
  try {
    if (!req.body.newPassword || !req.body.resetToken) {
      return res
        .status(400)
        .send(errorResponse(400, "newPassword not provided"));
    }
    const user = await User.findOne({
      where: {
        resetPasswordToken: req.body.resetToken,
      },
    });
    if (!user) {
      return res.status(400).send(errorResponse(400, "User not found"));
    }
    let newHashPassword = await bcrypt.hash(req.body.newPassword, 8);
    user.password = newHashPassword;
    await user.save();
    user.resetPasswordToken = null;
    await user.save();
    res.status(200).send(successResposne("Password Updated !"));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
