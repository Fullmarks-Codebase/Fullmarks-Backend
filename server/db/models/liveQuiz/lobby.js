module.exports = (sequelize, Sequelize) => {
  const Lobby = sequelize.define(
    "lobbies",
    {
      socket_id: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      room: {
        type: Sequelize.INTEGER,
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      completed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: true }
  );
  return Lobby;
};
