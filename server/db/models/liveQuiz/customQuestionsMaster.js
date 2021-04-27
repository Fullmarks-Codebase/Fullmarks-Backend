module.exports = (sequelize, Sequelize) => {
  const CustomQuestionsMaster = sequelize.define(
    "custom_questions_master",
    {
      name:{
        type: Sequelize.STRING,
      },
      createdBy: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return CustomQuestionsMaster;
};
  