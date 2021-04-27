const errorResponse = require("../utils/errorResponse");
const accessModules = require("../auth/accessModules");
const hasAccess = (accessModuleId) => {
  return function (req, res, next) {
    try {
      if (req.user.userAccessModules) {
        let userAccessModules = JSON.parse(req.user.userAccessModules);
        // Check if moduleId exists in modules
        if (accessModuleId in accessModules) {
          // Check if accessModule id exists in user Access Modules
          if (userAccessModules.includes(accessModuleId)) return next();
        } else {
          throw new Error();
        }
      } else {
        return next();
      }
      throw new Error();
    } catch (err) {
      return res
        .status(401)
        .send(errorResponse(401, "User do not have access to this module"));
    }
  };
};

module.exports = hasAccess;
