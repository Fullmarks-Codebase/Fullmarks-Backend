const fs = require("fs");
const imageCheck = require("./imageCheck");
const modifiedImageName = require("./modifyImageName");
const paths = {
  class: {
    aws: `${process.env.AWS_IMAGE_CLASS}`,
    local: `${process.env.class_image}`,
  },
  user: {
    aws: `${process.env.AWS_IMAGE_CUSTOMER}`,
    local: `${process.env.user_image}`,
  },
  question: {
    aws: `${process.env.AWS_IMAGE_QUESTION}`,
    local: `${process.env.question_image}`,
  },
  answers: {
    aws: `${process.env.AWS_IMAGE_ANSWERS}`,
    local: `${process.env.answers_image}`,
  },
  subjects: {
    aws: `${process.env.AWS_IMAGE_SUBJECT}`,
    local: `${process.env.subject_image}`,
  },
  custom_question: {
    aws: `${process.env.AWS_IMAGE_CUSTOM_QUESTION}`,
    local: `${process.env.custom_question}`,
  },
  custom_answers: {
    aws: `${process.env.AWS_IMAGE_CUSTOM_ANSWERS}`,
    local: `${process.env.custom_answers}`,
  },
  post: {
    aws: `${process.env.AWS_IMAGE_POST}`,
    local: `${process.env.post_image}`,
  },
  comment: {
    aws: `${process.env.AWS_IMAGE_COMMENT}`,
    local: `${process.env.comment_image}`,
  },
};

const singleImageAdd = (myFile, path, req) => {
  if (!imageCheck(myFile)) {
    return {
      status: 0,
      err: "Image type must be in png, jpeg, jpg. Got " + myFile.mimetype,
    };
  }
  let modifiedFileName = modifiedImageName(myFile.name);

  if (process.env.NODE_ENV === "production") {
    const s3 = req.app.get("s3");
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${paths[path].aws}/${modifiedFileName}`,
      Body: myFile.data,
    };
    s3.upload(params, function (err, data) {
      if (err)
        return {
          status: 0,
          err: err.toString(),
        };
    });
    return {
      status: 1,
      name: modifiedFileName,
    };
  } else {
    myFile.mv(`${paths[path].local}/${modifiedFileName}`, function (err) {
      if (err) {
        return {
          status: 0,
          err: err.toString(),
        };
      }
    });
    return {
      status: 1,
      name: modifiedFileName,
    };
  }
};

const singleImageUpdate = (myFile, path, req, existName) => {
  if (!imageCheck(myFile)) {
    return {
      status: 0,
      err: "Image type must be in png, jpeg, jpg. Got " + myFile.mimetype,
    };
  }
  let modifiedFileName = modifiedImageName(myFile.name);
  if (process.env.NODE_ENV === "production") {
    const s3 = req.app.get("s3");
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${paths[path].aws}/${modifiedFileName}`,
      Body: myFile.data,
    };
    s3.upload(params, function (err, data) {
      if (err)
        return {
          status: 0,
          err: err.toString(),
        };
    });
    s3.deleteObject(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${paths[path].aws}/${existName}`,
      },
      function (err, data) {
        if (err)
          return {
            status: 0,
            err: err.toString(),
          };
      }
    );
  } else {
    myFile.mv(`${paths[path].local}/${modifiedFileName}`, function (err) {
      if (err) {
        return {
          status: 0,
          err: err.toString(),
        };
      }
    });
    const oldImage = `${paths[path].local}/${existName}`;
    if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
  }
  return {
    status: 1,
    name: modifiedFileName,
  };
};

const singleImageDelete = (path, req, existName) => {
  if (process.env.NODE_ENV === "production") {
    const s3 = req.app.get("s3");
    s3.deleteObject(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${paths[path].aws}/${existName}`,
      },
      function (err, data) {
        if (err)
          return {
            status: 0,
            err: err.toString(),
          };
      }
    );
  } else {
    let oldImage = `${paths[path].local}/${existName}`;
    if (fs.existsSync(oldImage)) {
      fs.unlinkSync(oldImage);
    }
  }
  return {
    status: 1,
  };
};

module.exports = {
  singleImageAdd,
  singleImageUpdate,
  singleImageDelete,
};
