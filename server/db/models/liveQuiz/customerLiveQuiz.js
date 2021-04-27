module.exports = (sequelize, Sequelize) => {
  const CustomerLiveQuiz = sequelize.define(
    "customer_live_quiz",
    {
      room: {
        type: Sequelize.STRING,
      },
      started: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      timeLimit: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return CustomerLiveQuiz;
};
