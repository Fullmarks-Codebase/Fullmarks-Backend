module.exports = (sequelize, Sequelize) => {
  const UpdateRecord = sequelize.define(
    "update_record",
    {},
    {
      timestamps: true,
    }
  );
  return UpdateRecord;
};
