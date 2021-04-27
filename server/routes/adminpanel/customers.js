const db = require("../../db");
var User = db.users;
const Class = db.class;
const Guest = db.guest;
var router = require("express").Router();
const errorResponse = require("../../utils/errorResponse");
const authAdmin = require("../../auth/adminAuth");
const checkAdmin = require("../../auth/checkAdmin");
const { Op } = require("sequelize");
const successResponse = require("../../utils/successResponse");
const fs = require("fs");
var { promisify } = require("util");
var sizeOf = promisify(require("image-size"));
const modifiedImageName = require("../../utils/modifyImageName");
const sharp = require("sharp");
const imageCheck = require("../../utils/imageCheck");
const hasAccess = require("../../auth/hasAccess");

// To see module ids check auth/accessModules.js
let moduleId = 2;

router.post("/getSingleCustomer", authAdmin, (req, res) => {
  try {
    let where = {
      admin: {
        [Op.eq]: false,
      },
    };
    if (!req.body.customerId) {
      return res.status(400).send(errorResponse(400, "Need CustomerId"));
    }
    where["id"] = req.body.customerId;
    User.findAll({
      attributes: [
        "id",
        "username",
        "phoneNumber",
        "email",
        "otp",
        "dob",
        "userProfileImage",
        "thumbnail",
        "gender",
        "class",
        "googleId",
        "facebookId",
        "phoneId",
        "createdAt",
        "updatedAt",
      ],
      where: where,
    }).then(async (response) => {
      if (!response) {
        return res.status(400).send(errorResponse(400, "No Customer found"));
      }
      if (response[0].class) {
        const classes = await Class.findOne({
          where: { id: response[0].class },
        });
        response[0].class = classes;
      }
      if (req.body.customerId)
        res.status(200).send(successResponse("Success", 200, response));
      else
        return res.status(200).send(successResponse("Success", 200, response));
    });
  } catch (error) {
    return res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.post(
  "/",
  authAdmin,
  checkAdmin,
  hasAccess(moduleId),
  async (req, res) => {
    try {
      let where = {
        admin: {
          [Op.eq]: false,
        },
      };
      if (req.body.customerId) {
        where["id"] = req.body.customerId;
      }

      User.findAll({
        attributes: [
          "id",
          "username",
          "phoneNumber",
          "email",
          "otp",
          "dob",
          "userProfileImage",
          "gender",
          "class",
          "thumbnail",
          "facebookId",
          "phoneId",
          "googleId",
          "createdAt",
          "updatedAt",
        ],
        where: where,
      }).then((response) => {
        if (!response) {
          return res.status(400).send(errorResponse(400, "No Customer found"));
        }
        if (req.body.customerId)
          res.status(200).send(successResponse("Success", 200, response));
        else
          return res
            .status(200)
            .send(successResponse("Success", 200, response));
      });
    } catch (err) {
      return res.status(500).send(errorResponse(500, err.toString()));
    }
  }
);

router.post(
  "/add",
  authAdmin,
  checkAdmin,
  hasAccess(moduleId),
  async (req, res) => {
    try {
      if (
        (Object.keys(req.body).length === 0 &&
          req.body.constructor === Object) ||
        !parseInt(req.body.phoneNumber)
      ) {
        res.status(400).send(errorResponse(400, "Need Phone Number"));
      }
      let { phoneNumber, password } = req.body;
      if (!password) {
        password = null;
      }

      User.findOne({
        where: {
          phoneNumber: phoneNumber,
        },
      }).then(async (response) => {
        if (response) {
          return res
            .status(400)
            .send(errorResponse(400, "Phone number already exist"));
        }
        const classes = await Class.findOne({ limit: 1 });
        let classID = null;
        if (classes) {
          classID = classes.id;
        }

        let modifiedFileName = null;
        let thumbnailName = null;
        if (req.files) {
          if (req.files.userProfileImage) {
            const myFile = req.files.userProfileImage;
            if (!imageCheck(myFile)) {
              return res
                .status(400)
                .send(
                  errorResponse(
                    400,
                    "Image type must be in png, jpeg, jpg. Got " +
                      myFile.mimetype
                  )
                );
            }
            modifiedFileName = modifiedImageName(myFile.name);
            if (process.env.NODE_ENV === "production") {
              const s3 = req.app.get("s3");
              var params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${process.env.AWS_IMAGE_CUSTOMER}/${modifiedFileName}`,
                Body: myFile.data,
              };
              const data = await s3.upload(params).promise();
              var fileSizeInMegabytes = myFile.size / (1024 * 1024);
              if (fileSizeInMegabytes > 1) {
                thumbnailName = modifiedImageName("thumb_" + myFile.name);
                const sharpResult = await sharp(myFile.data).toBuffer();
                var params = {
                  Bucket: process.env.AWS_BUCKET_NAME,
                  Key: `${process.env.AWS_IMAGE_CUSTOMER}/${thumbnailName}`,
                  Body: sharpResult,
                };
                const data1 = await s3.upload(params).promise();
              }
            } else {
              await myFile.mv(`${process.env.user_image}/${modifiedFileName}`);
              var fileSizeInMegabytes = myFile.size / (1024 * 1024);
              if (fileSizeInMegabytes > 1) {
                const dimensions = await sizeOf(
                  `${process.env.user_image}/${modifiedFileName}`
                );
                thumbnailName = modifiedImageName("thumb_" + myFile.name);
                const sharpResult = await sharp(myFile.data)
                  .resize(dimensions.width, dimensions.height)
                  .withMetadata()
                  .toFile(`${process.env.user_image}/${thumbnailName}`);
              }
            }
          }
        }

        User.create({
          ...req.body,
          dob: req.body.dob || null,
          gender: req.body.gender || null,
          username: req.body.username || null,
          userProfileImage: modifiedFileName,
          thumbnail: thumbnailName || modifiedFileName,
          admin: false,
          class: classID,
        }).then((response) => {
          return res.status(201).send(successResponse("User Created", 200));
        });
      });
    } catch (err) {
      res.status(500).send(errorResponse(500, err.toString()));
    }
  }
);

router.put("/update", authAdmin, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !req.body.id
    ) {
      return res.status(400).send(errorResponse(400, "need id and data"));
    }

    const { id, email, gender, dob, username, userProfileImage } = req.body;
    if (gender) {
      if (![0, 1].includes(parseInt(gender))) {
        return res.status(400).send(errorResponse(400, " Need Valid Gender"));
      }
    }

    if (username) {
      if (username.trim().length < 1) {
        return res.status(400).send(errorResponse(400, " Need Valid Username"));
      }
    }

    const customer = await User.findOne({
      where: {
        id: id,
      },
    });

    if (!customer) {
      return res
        .status(400)
        .send(errorResponse(400, "no customer found with given id"));
    }

    if (req.body.phoneNumber) {
      if (parseInt(req.body.phoneNumber)) {
        if (req.body.phoneNumber.length !== 10) {
          return res.status(400).send(errorResponse(400, " Need Valid Number"));
        }
      } else {
        return res.status(400).send(errorResponse(400, " Need Valid Number"));
      }
      const phoneNumberCheck = await User.findOne({
        where: {
          phoneNumber: req.body.phoneNumber,
        },
      });
      if (phoneNumberCheck) {
        return res
          .status(400)
          .send(errorResponse(400, " PhoneNumberAlready Exist"));
      }
    }

    if (email) {
      const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.+([a-zA-Z0-9-]+)+$/;
      if (!emailRegexp.test(email)) {
        return res.status(400).send(errorResponse(400, " Need Valid Email"));
      }
      const emailCheck = await User.findOne({
        where: {
          email: email,
        },
      });

      if (emailCheck && emailCheck.email === email) {
        return res.status(400).send(errorResponse(400, "Email Already Exist"));
      }
    }

    let modifiedFileName = null;
    let thumbnailName = null;
    if (req.files) {
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
      if (process.env.NODE_ENV === "production") {
        const s3 = req.app.get("s3");
        modifiedFileName = modifiedImageName(myFile.name);
        var params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${process.env.AWS_IMAGE_CUSTOMER}/${modifiedFileName}`,
          Body: myFile.data,
        };
        const data = await s3.upload(params).promise();
        var fileSizeInMegabytes = myFile.size / (1024 * 1024);
        if (fileSizeInMegabytes > 1) {
          thumbnailName = modifiedImageName("thumb_" + myFile.name);
          const sharpResult = await sharp(myFile.data).toBuffer();
          var params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.AWS_IMAGE_CUSTOMER}/${thumbnailName}`,
            Body: sharpResult,
          };
          const data1 = s3.upload(params).promise();
        }
        const data3 = await s3
          .deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.AWS_IMAGE_CUSTOMER}/${customer.userProfileImage}`,
          })
          .promise();
        if (customer.thumbnail) {
          const data4 = await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${process.env.AWS_IMAGE_CUSTOMER}/${customer.thumbnail}`,
            })
            .promise();
        }
      } else {
        let oldImage = `${process.env.user_image}/${customer.userProfileImage}`;
        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
        oldImage = `${process.env.user_image}/${customer.thumbnail}`;
        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
        modifiedFileName = modifiedImageName(myFile.name);

        await myFile.mv(`${process.env.user_image}/${modifiedFileName}`);
        var fileSizeInMegabytes = myFile.size / (1024 * 1024);
        if (fileSizeInMegabytes > 1) {
          const dimensions = await sizeOf(
            `${process.env.user_image}/${modifiedFileName}`
          );
          thumbnailName = modifiedImageName("thumb_" + myFile.name);
          const sharpResult = await sharp(myFile.data)
            .resize(dimensions.width, dimensions.height)
            .withMetadata()
            .toFile(`${process.env.user_image}/${thumbnailName}`);
        }
      }
    }
    User.update(
      {
        ...req.body,
        userProfileImage: modifiedFileName || customer.userProfileImage,
        thumbnail:
          thumbnailName || modifiedFileName || customer.userProfileImage,
      },
      { where: { id: id } }
    ).then(async (result) => {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: [
          "id",
          "username",
          "phoneNumber",
          "email",
          "otp",
          "dob",
          "userProfileImage",
          "gender",
          "class",
          "googleId",
          "thumbnail",
          "facebookId",
          "phoneId",
          "createdAt",
          "updatedAt",
        ],
      });
      const classes = await Class.findOne({ where: { id: customer.class } });
      user.class = classes;
      return res
        .status(200)
        .send(successResponse("Customer Updated", 200, user));
    });
  } catch (err) {
    res.status(500).send(errorResponse(500, err.toString()));
  }
});

router.delete(
  "/:id",
  authAdmin,
  checkAdmin,
  hasAccess(moduleId),
  async (req, res) => {
    try {
      if (!req.params.id) {
        return res.status(400).send(errorResponse(400, "id required"));
      }
      const user = await User.findOne({ where: { id: req.params.id } });
      if (process.env.NODE_ENV === "production") {
        const s3 = req.app.get("s3");
        s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${process.env.AWS_IMAGE_CUSTOMER}/${user.userProfileImage}`,
        }).promise();
        if (user.thumbnail) {
          s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.AWS_IMAGE_CUSTOMER}/${user.thumbnail}`,
          }).promise();
        }
      } else {
        let oldImage = `${process.env.user_image}/${user.userProfileImage}`;
        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
        oldImage = `${process.env.user_image}/${user.dataValues.thumbnail}`;
        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
      }

      User.destroy({ where: { id: req.params.id } }).then((response) => {
        return res.status(200).send(successResponse("User Delete", 200));
      });
    } catch (error) {
      res.status(500).send(errorResponse(500, error.toString()));
    }
  }
);

router.post("/deleteImage", authAdmin, async (req, res) => {
  try {
    if (!parseInt(req.body.id)) {
      return res.status(400).send(errorResponse(400, "Need Proper Id"));
    }
    const { id } = req.body;
    const user = await User.findOne({ where: { id: id } });
    if (user.userProfileImage) {
      if (process.env.NODE_ENV === "production") {
        const s3 = req.app.get("s3");
        const data = await s3
          .deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.AWS_IMAGE_CUSTOMER}/${user.userProfileImage}`,
          })
          .promise();
        if (user.thumbnail) {
          const data = await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${process.env.AWS_IMAGE_CUSTOMER}/${user.thumbnail}`,
            })
            .promise();
        }
      } else {
        let oldImage = `${process.env.user_image}/${user.userProfileImage}`;
        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
        oldImage = `${process.env.user_image}/${user.thumbnail}`;
        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
      }
      user.userProfileImage = null;
      user.thumbnail = null;
      await user.save();
    }
    res.status(200).send(successResponse(`Image deleted`, 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/changeClass", authAdmin, async (req, res) => {
  try {
    if (!parseInt(req.body.customerId)) {
      return res.status(400).send(errorResponse(400, "Need proper customerId"));
    }
    if (!parseInt(req.body.classId)) {
      return res.status(400).send(errorResponse(400, "Need proper ClassId"));
    }
    const customer = await User.findOne({ where: { id: req.body.customerId } });
    if (!customer) {
      return res.status(400).send(errorResponse(400, "Customer doesnt exist"));
    }
    const classes = await Class.findOne({ where: { id: req.body.classId } });
    if (!classes) {
      return res.status(400).send(errorResponse(400, "Class doesnt exist"));
    }

    let classID = null;
    if (classes) {
      classID = classes.id;
    }
    User.update({ class: classID }, { where: { id: req.body.customerId } })
      .then((result) => {
        res.status(200).send(successResponse(`Class Updated`, 200));
      })
      .catch((err) => {
        res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/guest", async (req, res) => {
  try {
    if (req.body.imei) {
      if (req.body.imei.length > 13) {
        let guest = await Guest.findOne({ where: { imei: req.body.imei } });
        if (!guest) {
          guest = await Guest.create({
            imei: req.body.imei,
            played: 0,
            class: null,
          });
          return res.status(200).send(successResponse("Success", 200, guest));
        }
        if (guest.class) {
          const classes = await db.class.findOne({
            where: { id: guest.class },
          });
          guest.class = classes;
        }
        return res.status(200).send(successResponse("Success", 200, guest));
      } else {
        return res.status(400).send(errorResponse(400, "Need IMEI"));
      }
    } else {
      return res.status(400).send(errorResponse(400, "Need IMEI"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/guestClassChange", async (req, res) => {
  try {
    if (!parseInt(req.body.id || !parseInt(req.body.classId))) {
      return res
        .status(400)
        .send(errorResponse(400, "Need guestId and classId"));
    }
    const guestcheck = await db.guest.findOne({ where: { id: req.body.id } });
    if (!guestcheck) {
      return res.status(400).send(errorResponse(400, "Guest Doesnt Exist"));
    }
    const classes = await db.class.findOne({ where: { id: req.body.classId } });
    if (!classes) {
      return res.status(400).send(errorResponse(400, "Class Doesnt Exist"));
    }
    guestcheck.class = req.body.classId;
    await guestcheck.save();
    guestcheck.class = classes;
    return res
      .status(200)
      .send(successResponse("Class Updated", 200, guestcheck));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post(
  "/front",
  authAdmin,
  checkAdmin,
  hasAccess(moduleId),
  async (req, res) => {
    try {
      if (!req.body.customerId) {
        return res.status(400).send(errorResponse(400, "Need CustomerId"));
      }
      const user = await User.findOne({
        where: {
          id: req.body.customerId,
        },
      });
      if (!user) {
        return res
          .status(500)
          .send(errorResponse(500, "Customer Doenst Exist"));
      }
      return res.status(200).send(successResponse("Success", 200, user));
    } catch (error) {
      return res.status(500).send(errorResponse(500, error.toString()));
    }
  }
);
module.exports = router;
