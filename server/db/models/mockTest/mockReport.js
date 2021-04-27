module.exports = (sequelize, Sequelize) => {
  const MockReport = sequelize.define(
    "mock_report",
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
  return MockReport;
};
