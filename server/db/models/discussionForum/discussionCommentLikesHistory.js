module.exports = (sequelize, Sequelize) =>{
  const CommentLikeHistory = sequelize.define('discussion_comment_like_histories', {}, { timestamps:true })
  return CommentLikeHistory;
}