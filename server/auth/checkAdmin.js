const errorResponse = require("../utils/errorResponse");
const check = (req,res,next) =>{
  try{
    if (!req.user.admin) {
      throw new Error()
    }
    next();
  }
  catch(err){
    return res.status(403).send(errorResponse(403, "Not Admin"));
  }
}

module.exports = check