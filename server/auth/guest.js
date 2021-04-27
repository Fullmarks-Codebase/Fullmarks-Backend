const db = require("../db");
const Guest = db.guest;
const errorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

const guestCheck = async (req, res, next) => {
  try {
    if (req.body.guest === "true") {
      if (req.body.id) {
        const guest = await Guest.findOne({ where: { id: req.body.id } });
        if (guest) {
          if (guest.played > 2) {
            return res.status(200).send(successResponse("Success", 200, guest));
          }
          guest.played += 1;
          await guest.save();
        }
        return res.status(200).send(successResponse("Success", 200, guest));
      } else {
        return res.status(400).send(errorResponse(400, "Need id"));
      }
    }
    next();
  } catch (err) {
    return res.status(500).send(errorResponse(500, err.toString()));
  }
};

module.exports = guestCheck;
