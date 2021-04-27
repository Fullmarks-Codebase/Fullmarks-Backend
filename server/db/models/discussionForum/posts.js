const moment = require("moment");
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
    }
  );
  return Posts;
};
