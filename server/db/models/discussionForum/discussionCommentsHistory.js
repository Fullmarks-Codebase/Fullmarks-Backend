module.exports = (sequelize, Sequelize) => {
  const CommentHistory = sequelize.define(
    "discussion_comment_histories",
    {
      comment: {
        type: Sequelize.TEXT,
      },
      comment_image: {
        type: Sequelize.STRING,
      },
      likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: true, charset: "utf8mb4", collate: "utf8mb4_unicode_ci" }
  );
  return CommentHistory;
};
