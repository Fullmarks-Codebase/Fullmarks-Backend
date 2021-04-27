const router = require("express").Router();
const { Op } = require("sequelize");
const auth = require("../../../auth/adminAuth");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const Friend = db.friends;
const Users = db.users;

async function findNumber(i, id) {
  return new Promise(function (resolve, reject) {
    let temp = {};
    if (i.phoneNumber) {
      temp["phoneNumber"] = i.phoneNumber;
    } else {
      temp["email"] = i.email;
    }

    Users.findOne({
      attributes: ["id"],
      where: {
        admin: {
          [Op.eq]: false,
        },
        id: { [Op.ne]: id },
        ...temp,
      },
    })
      .then(async (result) => {
        if (result) {
          Friend.findOne({
            where: {
              fromId: id,
              toId: result.id,
              [Op.or]: [{ status: 0 }, { status: 1 }],
            },
          })
            .then(async (friend) => {
              if (friend) {
                resolve(1);
              } else {
                const notFriend = await Users.findOne({
                  where: { id: result.id },
                  attributes: [
                    "id",
                    "username",
                    "phoneNumber",
                    "thumbnail",
                    "userProfileImage",
                  ],
                });
                resolve(notFriend);
              }
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          resolve(-1);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

router.post("/notFriend", auth, async (req, res) => {
  try {
    let promise = [];
    const users = await db.users.findAll({
      where: { id: { [Op.ne]: req.user.id } },
    });
    users.map((i) => {
      promise.push(findNumber(i, req.user.id));
    });
    Promise.all(promise)
      .then((result) => {
        const notFriend = result.filter((i) => {
          if (typeof i === "object") return i;
        });
        return res.status(200).send(successResponse("Success", 200, notFriend));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/myfriends", auth, (req, res) => {
  try {
    Friend.findAll({
      where: {
        [Op.or]: [{ fromId: req.user.id }, { toId: req.user.id }],
        status: {
          [Op.eq]: 1,
        },
      },
      attributes: ["id", "sender", "fromId", "toId"],
      include: [
        {
          model: Users,
          as: "to",
          attributes: [
            "phoneNumber",
            "userProfileImage",
            "username",
            "id",
            "thumbnail",
          ],
        },
        {
          model: Users,
          as: "from",
          attributes: [
            "phoneNumber",
            "userProfileImage",
            "username",
            "id",
            "thumbnail",
          ],
        },
      ],
    })
      .then((result) => {
        let friends = result.map((i) => {
          if (req.user.id === i.fromId) {
            return i.to;
          } else {
            return i.from;
          }
        });
        return res.status(200).send(successResponse("Success", 200, friends));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/sentRequest", auth, async (req, res) => {
  try {
    if (!req.body.numbers) {
      return res.status(400).send(errorResponse(400, "Need Id"));
    }
    const numbers = req.body.numbers
      .replace(new RegExp('"', "g"), "")
      .replace("[", "")
      .replace("]", "")
      .split(",");
    if (numbers.length > 0 && numbers[0] === "")
      return res.status(400).send(errorResponse(400, "Need Id"));

    let promise = [];

    for (let number of numbers) {
      promise.push(sendFriendRequest(number, req));
    }

    Promise.all(promise)
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

async function sendFriendRequest(number, req) {
  return new Promise(async (resolve, reject) => {
    const user = await Users.findOne({
      where: {
        id: parseInt(number),
      },
      attributes: [
        "id",
        "username",
        "phoneNumber",
        "userProfileImage",
        "email",
        "registrationToken",
      ],
    });

    if (!user) {
      return resolve({
        status: -1,
        message: `User_${number} doesnt exist`,
      });
    }

    const alreadySent = await Friend.findOne({
      where: {
        fromId: req.user.id,
        toId: user.id,
      },
    });

    if (alreadySent) {
      if (parseInt(alreadySent.status) === parseInt(1))
        return resolve({
          status: 1,
          message: `Already Friend with ${user.username}`,
        });
      if (parseInt(alreadySent.status) === parseInt(0))
        return resolve({
          status: 0,
          message: `Already send the request to ${user.username}`,
        });
    }
    Friend.bulkCreate([
      { status: 0, fromId: req.user.id, toId: user.id, sender: req.user.id },
    ])
      .then(async (result) => {
        const admin = req.app.get("admin");

        const data = await Friend.findOne({
          where: {
            id: result[0].id,
          },
          attributes: {
            exclude: ["fromId", "toId"],
          },
          include: [
            {
              model: Users,
              as: "from",
              required: false,
              attributes: [
                "id",
                "username",
                "phoneNumber",
                "userProfileImage",
                "thumbnail",
              ],
            },
            {
              model: Users,
              as: "to",
              required: false,
              attributes: [
                "id",
                "username",
                "phoneNumber",
                "userProfileImage",
                "thumbnail",
              ],
            },
          ],
        });

        var payload = {
          notification: {
            title: `Friend Request from ${data.from.username}`,
            body: `Accept or Reject`,
          },
          data: {
            title: `Friend Request from ${data.from.username}`,
            body: `Accept or Reject`,
          },
        };
        await db.notifications.create({
          ...payload.notification,
          userId: user.id,
          notifyType: 2,
        });
        if (user.registrationToken) {
          let response = await admin
            .messaging()
            .sendToDevice(user.registrationToken, payload);
          console.log(response);
        }
        return resolve({ status: 1, message: "Sent", result: data });
      })
      .catch((err) => {
        return reject({ status: -2, message: err.toString() });
      });
  });
}

router.post("/requestResponse", auth, async (req, res) => {
  try {
    if (
      !parseInt(req.body.id) ||
      !parseInt(req.body.fromId) ||
      !parseInt(req.body.toId) ||
      !parseInt(req.body.status)
    ) {
      return res
        .status(400)
        .send(errorResponse(400, "Need Request Id and Status"));
    }

    const requestExist = await Friend.findOne({ where: { id: req.body.id } });
    if (!requestExist) {
      return res.status(400).send(errorResponse(400, "Request Doesnt Exist"));
    }

    const alreadySent = await Friend.findOne({
      where: {
        fromId: req.body.fromId,
        toId: req.body.toId,
      },
    });

    if (alreadySent) {
      if (parseInt(alreadySent.status) === parseInt(1))
        return res.status(200).send(
          successResponse("Success", 200, {
            status: 1,
            message: `Already Friend`,
          })
        );
    }

    /* delete record if reject */
    if (req.body.status === "2") {
      const result = await Friend.destroy({
        where: {
          fromId: req.body.fromId,
          toId: req.body.toId,
        },
      });
      return res.status(200).send(successResponse("Success", 200));
    }
    if (req.body.status === "1") {
      await Users.update(
        {
          buddies: db.sequelize.literal(`buddies + 1`),
        },
        {
          where: {
            id: {
              [Op.in]: [req.body.fromId, req.body.toId],
            },
          },
        }
      );
    }

    const fromUser = await db.users.findOne({
      where: {
        id: req.body.fromId,
      },
      attributes: ["id", "username"],
    });
    const toUser = await db.users.findOne({
      where: {
        id: req.body.toId,
      },
      attributes: ["id", "username"],
    });

    var payload = {
      notification: {
        title: `Reponse from ${
          toUser.username || toUser.email || toUser.phoneNumber
        }`,
        body:
          `Your Request has been ` +
          (req.body.status === "1" ? "accepted" : "rejected"),
      },
      data: {
        title: `Reponse from ${
          toUser.username || toUser.email || toUser.phoneNumber
        }`,
        body:
          `Your Request has been ` +
          (req.body.status === "1" ? "accepted" : "rejected"),
      },
    };

    await db.notifications.create({
      ...payload.notification,
      userId: fromUser.id,
      notifyType: 2,
    });

    Friend.update(
      { status: parseInt(req.body.status) },
      {
        where: {
          id: req.body.id,
        },
      }
    )
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200));
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/requestRecieved", auth, async (req, res) => {
  try {
    const requests = await Friend.findAll({
      where: {
        toId: req.user.id,
        status: 0,
      },
      include: [
        {
          model: db.users,
          as: "from",
          required: false,
          attributes: ["id", "username", "userProfileImage", "thumbnail"],
        },
      ],
      order: [["id", "DESC"]],
    });
    return res.status(200).send(successResponse("Success", 200, requests));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/requestSent", auth, async (req, res) => {
  try {
    const requests = await Friend.findAll({
      where: {
        fromId: req.user.id,
        status: 0,
      },
      include: [
        {
          model: db.users,
          as: "to",
          required: false,
          attributes: ["id", "username", "userProfileImage", "thumbnail"],
        },
      ],
      group: ["id"],
      order: [["id", "DESC"]],
    });
    res.status(200).send(successResponse("Success", 200, requests));
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
