module.exports = (sequelize, Sequelize) => {
  const FixSubjects = sequelize.define(
    "fix_subjects",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  return FixSubjects;
};
