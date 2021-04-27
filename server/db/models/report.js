module.exports = (sequelize, Sequelize) => {
  const Report = sequelize.define(
    "report",
    {
      user_answer:{
        type: Sequelize.STRING
      },
      time_taken:{
        type: Sequelize.INTEGER
      },
      correct_answer:{
        type: Sequelize.STRING
      },
    },
    {
      timestamps: true,
    }
  );
  return Report;
};
