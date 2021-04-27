module.exports = (sequelize, Sequelize) => {
  const CustomerLiveQuizQuestions = sequelize.define(
    "customer_live_quiz_questions",
    {},
    {
      timestamps: true,
    }
  );
  return CustomerLiveQuizQuestions;
};
