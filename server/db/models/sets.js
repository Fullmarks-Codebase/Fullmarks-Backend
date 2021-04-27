module.exports = (sequelize, Sequelize) => {
  const Sets = sequelize.define(
    "sets",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      createdBy: {
        type: Sequelize.INTEGER,
      },
      updatedBy: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return Sets;
};
