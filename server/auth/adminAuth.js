const jwt = require("jsonwebtoken");
const db = require("../db");
const Users = db.users;
const errorResponse = require("../utils/errorResponse");

const authAdmin = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"] || req.headers.cookie.split("=")[1];
    if (!token) {
      throw new Error("Please authenticate");
    }
    const { id } = await jwt.verify(token, process.env.JWT_KEY);
    const user = await Users.findOne({ where: { id: id } });
    if (user.token !== token) {
      throw new Error("Token expired or invalid, please re-login");
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).send(errorResponse(403, "Please authenticate"));
  }
};

module.exports = authAdmin;
