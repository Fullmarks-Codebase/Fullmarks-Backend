module.exports = (sequelize, Sequelize) => {
  const PostImages = sequelize.define(
    "post_images",
    {
      image_name: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  return PostImages;
};
