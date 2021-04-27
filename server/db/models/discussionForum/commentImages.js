module.exports = (sequelize, Sequelize) => {
  const CommentImages = sequelize.define(
    "comment_images",
    {
      image_name: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  return CommentImages;
};
