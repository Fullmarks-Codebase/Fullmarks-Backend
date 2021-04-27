module.exports = (sequelize, Sequelize) => {
  const Friends = sequelize.define(
    "friends",
    {
      status: {
        type: Sequelize.INTEGER,
      },
      sender: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return Friends;
};
