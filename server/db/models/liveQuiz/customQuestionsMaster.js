module.exports = (sequelize, Sequelize) => {
  const CustomQuestionsMaster = sequelize.define(
    "custom_questions_master",
    {
      name: {
        type: Sequelize.STRING,
      },
      createdBy: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    }
  );
  return CustomQuestionsMaster;
};
