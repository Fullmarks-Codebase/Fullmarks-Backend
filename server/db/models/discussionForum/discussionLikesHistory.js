module.exports = (sequelize, Sequelize) =>{
  const LikeHistory = sequelize.define('discussion_like_histories', {}, { timestamps:true })
  return LikeHistory;
}