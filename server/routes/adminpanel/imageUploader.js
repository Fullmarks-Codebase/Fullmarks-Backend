const router = require("express").Router();
let path = require("path");
let modifyImageName = require("../../utils/modifyImageName");
const auth = require("../../auth/adminAuth");
const checkAdmin = require("../../auth/checkAdmin");
// var { promisify } = require("util");

var sizeOf = require("image-size");
const fs = require("fs");
const imageCheck = require("../../utils/imageCheck");
const errorResponse = require("../../utils/errorResponse");
const successResponse = require("../../utils/successResponse");
const sharp = require("sharp");
const hasAccess = require("../../auth/hasAccess");

// To see module ids check auth/accessModules.js
let moduleId = 8;

router.post(
  "/upload",
  auth,
  checkAdmin,
  hasAccess(moduleId),
  async (req, res) => {
    if (req.files) {
      if (!req.files.image) {
        return res.send(errorResponse(400, "Need an Image"));
      }
      let imageFile = req.files.image;
      if (!imageCheck(imageFile)) {
        // console.log(req.files);
        return res.send(
          errorResponse(400, `Expected an image but got ${imageFile.mimetype}}`)
        );
      }
      try {
        let fileSizeInMegabytes = imageFile.size / (1024 * 1024);
        let newFileName = modifyImageName(imageFile.name);
        let sharpResult;
        if (fileSizeInMegabytes > 1) {
          // console.log("Compressing image");
          let dimensions = sizeOf(imageFile.data);
          newFileName = "compressed_" + newFileName;
          // console.log("dimensions", dimensions);
          sharpResult = await sharp(imageFile.data)
            .resize(dimensions.width / 4, dimensions.height / 4)
            .withMetadata()
            .toBuffer();
        }
        let fileData = imageFile.data;
        const s3 = req.app.get("s3");

        var params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `uploadedImages/${newFileName}`,
          Body: sharpResult ? sharpResult : fileData,
        };

        const upload = await s3.upload(params, (err, data) => {
          if (err) {
            console.log(err);
            return res.send({ message: "Error" }, err);
          }
          res.send(successResponse("Uploaded", 200, { url: data.Location }));
        });
        // console.log(upload);
      } catch (err) {
        console.log(err);
        return res.send(errorResponse(400, "error While Uploading"));
      }

      // Upload to server
      // let response = await uploadFile(
      //   "images/posts",
      //   null,
      //   imageFile,
      //   req
      // );
      ////
    } else {
      res.send(errorResponse(400, "Need an Image"));
    }
  }
);

async function uploadFile(path, awsPath, file, req) {
  return new Promise(async function (resolve, reject) {
    try {
      await file.mv(`${path}/${file.name}`);

      resolve(1);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = router;
