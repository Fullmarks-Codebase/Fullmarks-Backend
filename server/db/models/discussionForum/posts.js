module.exports = (sequelize, Sequelize) => {
  const Posts = sequelize.define(
    "posts",
    {
      question: {
        type: Sequelize.TEXT,
      },
      question_image: {
        type: Sequelize.STRING,
      },
      likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      comments: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      // charset: "utf8",
      // collate: "utf8_unicode_ci",
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    }
  );
  return Posts;
};
