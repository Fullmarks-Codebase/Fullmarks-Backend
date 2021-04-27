module.exports = (sequelize, Sequelize) => {
  const MockReportMaster = sequelize.define(
    "mock_report_master",
    {
      incorrect: {
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
      skipped: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return MockReportMaster;
};
