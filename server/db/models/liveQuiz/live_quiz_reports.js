module.exports = (sequelize, Sequelize) => {
  const LiveQuizReport = sequelize.define(
    "live_quiz_report",
    {
      user_answer: {
        type: Sequelize.STRING,
      },
      time_taken: {
        type: Sequelize.INTEGER,
      },
      correct_answer: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  return LiveQuizReport;
};
