module.exports = (sequelize, Sequelize) => {
  const MockMaster = sequelize.define("mock_master", {
    name: {
      type: Sequelize.STRING,
    },
    time: {
      type: Sequelize.INTEGER,
      defaultValue: 9000,
    },
  });
  return MockMaster;
};
