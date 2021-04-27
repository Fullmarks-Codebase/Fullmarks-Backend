const db = require("../../db");
const jwt = require("jsonwebtoken");
const errorResponse = require("../../utils/errorResponse");
const successResponse = require("../../utils/successResponse");
const User = db.users;
const Class = db.class;
const router = require("express").Router();
const randomOtp = require("../../utils/randomOtp");
const auth = require("../../auth/adminAuth");
const modifyImageName = require("../../utils/modifyImageName");
const bcrpyt = require("bcrypt");

// router.post("/tokenCheck", auth, (req, res) => {
//   try {
//     res.status(200).send(successResponse("Valid Token",200));
//   } catch (e) {}
// });

// router.post("/checkin", async (req, res) => {
//   try {
//     if (!req.body.phoneNumber) {
//       return res.status(400).send(errorResponse(400, "Need Phone Number"));
//     }
//     const { phoneNumber } = req.body;
//     const customer = await User.findOne({ where: { phoneNumber } });
//     // const otp = randomOtp(100000, 999999);
//     const otp = 111111;
//     if (!customer) {
//       const classes = await Class.findOne({limit:1})
//       let classID = null;
//       if(classes){
//         classID = classes.id
//       }
//       const result = await User.create({
//         phoneNumber,
//         otp,
//         admin: false,
//         class: classID
//       });
//       return res
//         .status(200)
//         .send(successResponse('Success', 200, { phoneNumber }));
//     }
//     customer.otp = otp;
//     await customer.save();
//     /*
//       sending otp to user
//     */
//     return res.status(200).send(successResponse('Success', 200,{ phoneNumber }));
//   } catch (error) {
//     return res.status(500).send(errorResponse(500, error.toString()));
//   }
// });

router.post("/verify", async (req, res) => {
  try {
    if (!req.body.otp || !req.body.phoneNumber) {
      return res.status(400).send(errorResponse(400, "OTP required"));
    }
    const { otp, phoneNumber } = req.body;
    const customer = await User.findOne({
      where: { phoneNumber: phoneNumber },
    });
    if (!customer) {
      return res.status(404).send(errorResponse(404, "Phone number not found"));
    }
    if (customer.otp === otp) {
      const token = await jwt.sign({ id: customer.id }, process.env.JWT_KEY);
      customer.token = token;
      customer.otp = null;
      await customer.save();

      const classes = await Class.findOne({ where: { id: customer.class } });

      let modifiedCustomer = {
        id: customer.id,
        username: customer.username,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        dob: customer.dob,
        gender: customer.gender,
        userProfileImage: customer.userProfileImage,
        token: customer.token,
        class: classes,
        createdAt: customer.createdAt,
      };
      return res
        .status(200)
        .send(successResponse("Success", 200, modifiedCustomer));
    }
    return res.status(400).send(errorResponse(400, "Wrong OTP or OTP expired"));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/checkin", async (req, res) => {
  try {
    let token;
    let customer;
    let where = {};
    if (req.body.googleSign === "true") {
      if (!req.body.email.trim() || !req.body.googleId) {
        return res
          .status(400)
          .send(errorResponse(400, " Need email, googleId, username"));
      }
      const { email } = req.body;
      const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegexp.test(email)) {
        return res.status(400).send(errorResponse(400, " Need Valid Email"));
      }
      where["email"] = email;
    } else if (req.body.facebookSign === "true") {
      if (!req.body.email.trim() || !req.body.facebookId) {
        return res
          .status(400)
          .send(errorResponse(400, " Need email, facebookId, username"));
      }
      const { email } = req.body;
      const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegexp.test(email)) {
        return res.status(400).send(errorResponse(400, " Need Valid Email"));
      }
      where["email"] = email;
    } else if (req.body.phoneSign === "true") {
      if (
        !parseInt(req.body.phoneNumber) ||
        req.body.phoneNumber.length !== 10 ||
        !req.body.phoneId
      ) {
        return res
          .status(400)
          .send(errorResponse(400, " Need Proper PhoneNumber, phoneId"));
      }
      const { phoneNumber } = req.body;
      where["phoneNumber"] = phoneNumber;
    } else {
      return res
        .status(400)
        .send(errorResponse(400, "Need Proper Selection for Signin"));
    }

    customer = await User.findOne({
      where: where,
      attributes: [
        "id",
        "username",
        "email",
        "phoneNumber",
        "dob",
        "gender",
        "userProfileImage",
        "thumbnail",
        "token",
        "class",
        "phoneId",
        "googleId",
        "facebookId",
        "createdAt",
      ],
    });

    if (!req.body.registrationToken) {
      return res
        .status(400)
        .send(errorResponse(400, "Need Registration Token"));
    }
    /*  If new user register   */
    if (!customer) {
      // const classes = await Class.findOne({ limit: 1 });
      // let classID = null;
      // if (classes) {
      //   classID = classes.id;
      // }
      let modifiedFileName = null;
      if (req.files) {
        if (req.files.userProfileImage) {
          const myFile = req.files.userProfileImage;
          if (!imageCheck(myFile)) {
            return res
              .status(400)
              .send(
                errorResponse(
                  400,
                  "Image type must be in png, jpeg, jpg. Got " + myFile.mimetype
                )
              );
          }
          modifiedFileName = modifyImageName(myFile.name);
          myFile.mv(
            `${process.env.user_image}/${modifiedFileName}`,
            function (err) {
              if (err) {
                console.log(err);
                return res.status(500).send({ msg: "Error occured" });
              }
            }
          );
        }
      }

      const result = await User.create({
        ...req.body,
        admin: false,
        userProfileImage: modifiedFileName,
        phoneNumber: parseInt(req.body.phoneNumber) || null,
        registrationToken: req.body.registrationToken,
      });

      customer = await User.findOne({
        where: { id: result.id },
        attributes: [
          "id",
          "username",
          "email",
          "phoneNumber",
          "dob",
          "gender",
          "userProfileImage",
          "token",
          "class",
          "thumbnail",
          "phoneId",
          "googleId",
          "facebookId",
          "createdAt",
        ],
      });

      token = await jwt.sign({ id: result.id }, process.env.JWT_KEY);
      const updateToken = await User.update(
        { token: token },
        { where: { id: customer.id } }
      );
      const modifiedCustomer = {
        ...customer.dataValues,
        token: token,
      };
      return res
        .status(200)
        .send(successResponse("Registered", 200, modifiedCustomer));
    }

    /*  alreay exists, check the id for validation   */

    // if(req.body.phoneSign){
    //   let decodedPassword = await bcrpyt.compare(req.body.phoneId, customer.phoneId);
    //   if(customer.phoneNumber !== req.body.phoneNumber || !decodedPassword){
    //     return res.status(400).send(errorResponse(400,"Wrong PhoneNumber or Phone Id"));
    //   }
    // }
    // else if(req.body.googleSign){
    //   let decodedPassword = await bcrpyt.compare(req.body.googleId, customer.googleId);
    //   if(customer.email!==req.body.email || !decodedPassword){
    //     return res.status(400).send(errorResponse(400,"Wrong Id"));
    //   }
    // }
    // else if (req.body.facebookSign){
    //   let decodedPassword = await bcrpyt.compare(req.body.facebookId, customer.facebookId);
    //   if(customer.email!==req.body.email || !decodedPassword){
    //     return res.status(400).send(errorResponse(400,"Wrong Id"));
    //   }
    // }

    /*  alreay exists, make new token and send  */
    token = await jwt.sign({ id: customer.id }, process.env.JWT_KEY);
    const updateToken = await User.update(
      { token: token, registrationToken: req.body.registrationToken },
      { where: { id: customer.id } }
    );
    const classes = await Class.findOne({ where: { id: customer.class } });

    const modifiedCustomer = {
      ...customer.dataValues,
      token: token,
      class: classes,
    };

    return res
      .status(200)
      .send(successResponse("Logged In", 200, modifiedCustomer));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});
module.exports = router;
