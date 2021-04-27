module.exports = (sequelize, Sequelize) => {
  const NotificationHistory = sequelize.define(
    "notification_histories",
    {
      title: {
        type: Sequelize.STRING,
      },
      body: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
      },
      room: {
        type: Sequelize.INTEGER,
      },
      notifyType: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
    }
  );
  return NotificationHistory;
};
