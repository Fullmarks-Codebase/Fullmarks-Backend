module.exports = (sequelize, Sequelize) => {
  const CustomQuestions = sequelize.define(
    "custom_questions",
    {
      question: {
        type: Sequelize.TEXT,
      },
      question_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ans_one: {
        type: Sequelize.STRING,
      },
      ans_one_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ans_one_status: {
        type: Sequelize.BOOLEAN,
      },
      ans_two: {
        type: Sequelize.STRING,
      },
      ans_two_image: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ans_two_status: {
        type: Sequelize.BOOLEAN,
      },
      ans_three: {
        type: Sequelize.STRING,
      },
      ans_three_image: {
        allowNull: true,

        type: Sequelize.STRING,
      },
      ans_three_status: {
        type: Sequelize.BOOLEAN,
      },
      ans_four: {
        type: Sequelize.STRING,
      },
      ans_four_image: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ans_four_status: {
        type: Sequelize.BOOLEAN,
      },
      createdBy: {
        type: Sequelize.INTEGER,
      },
      updatedBy: {
        type: Sequelize.INTEGER,
      },
      time: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    }
  );
  return CustomQuestions;
};
