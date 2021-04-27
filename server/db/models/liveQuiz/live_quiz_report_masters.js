module.exports = (sequelize, Sequelize) => {
  const LiveQuizReportMaster = sequelize.define(
    "live_quiz_report_masters",
    {
      incorrect: {
        type: Sequelize.INTEGER,
      },
      skipped: {
        type: Sequelize.INTEGER,
      },
      correct: {
        type: Sequelize.INTEGER,
      },
      accuracy: {
        type: Sequelize.INTEGER,
      },
      avg_time: {
        type: Sequelize.STRING,
      },
      total_marks: {
        type: Sequelize.INTEGER,
      },
      time_taken: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return LiveQuizReportMaster;
};
