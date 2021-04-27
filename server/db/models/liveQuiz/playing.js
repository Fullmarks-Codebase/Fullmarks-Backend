module.exports = (sequelize, Sequelize) => {
  const Playing = sequelize.define(
    "playing",
    {
      socket_id: {
        type: Sequelize.STRING,
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      room: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      submitted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: true }
  );
  return Playing;
};
