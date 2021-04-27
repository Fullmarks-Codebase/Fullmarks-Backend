module.exports = (sequelize, Sequelize) => {
  const MockMaster = sequelize.define("mock_master", {
    name: {
      type: Sequelize.STRING,
    },
    correct_marks: {
      type: Sequelize.FLOAT(4, 2),
    },
    incorrect_marks: {
      type: Sequelize.FLOAT(4, 2),
    },
    time: {
      type: Sequelize.INTEGER,
      defaultValue: 9000,
    },
  });
  return MockMaster;
};
