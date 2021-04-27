module.exports = (sequelize, Sequelize) => {
  const Guest = sequelize.define("guest", {
    imei: {
      type: Sequelize.TEXT,
    },
    played: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    class: {
      type: Sequelize.INTEGER,
    },
  });
  return Guest;
};
