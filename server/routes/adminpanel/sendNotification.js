const db = require("../../db");
const User = db.users;
var router = require("express").Router();
const errorResponse = require("../../utils/errorResponse");
const successResponse = require("../../utils/successResponse");
const auth = require("../../auth/adminAuth");
const checkAdmin = require("../../auth/checkAdmin");
const NotificationHistory = db.notifications;

router.post("/", auth, checkAdmin, async (req, res) => {
  try {
    if (!req.body.title || !req.body.message) {
      return res.status(400).send(errorResponse(400, "Need Title And Message"));
    }
    if (!req.body.title.trim() || !req.body.message.trim()) {
      return res.status(400).send(errorResponse(400, "Need Title And Message"));
    }

    var payload = {
      notification: {
        title: req.body.title.trim(),
        body: req.body.message.trim(),
      },
      data: {
        title: req.body.title.trim(),
        body: req.body.message.trim(),
      },
    };
    let promises = [];

    User.findAll({ attributes: ["id", "registrationToken"] })
      .then((result) => {
        result.forEach((obj, index) => {
          if (obj.dataValues.registrationToken)
            promises.push(
              sendNotification(
                obj.dataValues.registrationToken,
                payload,
                obj.dataValues.id,
                req
              )
            );
        });
      })
      .then(() => {
        Promise.all(promises)
          .then((result) => {
            return res
              .status(200)
              .send(successResponse("Success", 200, result));
          })
          .catch((error) => {
            return res.status(500).send(errorResponse(500, error.toString()));
          });
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

function sendNotification(token, payload, id, req) {
  return new Promise(async function (resolve, reject) {
    const admin = req.app.get("admin");
    admin
      .messaging()
      .sendToDevice(token, payload)
      .then(function (response) {
        NotificationHistory.create({ ...payload.notification, userId: id })
          .then((result) => {
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

router.post("/getAll", auth, (req, res) => {
  try {
    NotificationHistory.findAll({
      where: { userId: req.user.id },
      order: [["id", "DESC"]],
    })
      .then((result) => {
        result.map((i, index) => {
          i.dataValues["createdAt"] = timeDifference(
            new Date(),
            i.dataValues.createdAt
          );
        });
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.put("/read", auth, async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).send(errorResponse(400, "Need notification id"));
    }
    const notiCheck = await NotificationHistory.findOne({
      where: { id: req.body.id },
    });
    if (!notiCheck) {
      return res
        .status(400)
        .send(errorResponse(400, "Notification Doesnt exist for you"));
    }
    NotificationHistory.update(
      { status: true },
      { where: { userId: req.user.id, id: req.body.id } }
    )
      .then((result) => {
        return res.status(200).send(successResponse("Read", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.get("/count", auth, (req, res) => {
  try {
    NotificationHistory.count({
      where: {
        status: 0,
        userId: req.user.id,
      },
    })
      .then((result) => {
        res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
