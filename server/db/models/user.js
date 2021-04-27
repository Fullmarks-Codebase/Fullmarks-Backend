const bcrypt = require("bcrypt");
module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define(
    "users",
    {
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      otp: {
        type: Sequelize.STRING,
      },
      dob: {
        type: Sequelize.DATE,
      },
      gender: {
        type: Sequelize.INTEGER,
      },
      userProfileImage: {
        type: Sequelize.STRING,
      },
      class: {
        type: Sequelize.INTEGER,
      },
      googleId: {
        type: Sequelize.TEXT,
      },
      facebookId: {
        type: Sequelize.TEXT,
      },
      phoneId: {
        type: Sequelize.TEXT,
      },
      registrationToken: {
        type: Sequelize.TEXT,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      admin: {
        type: Sequelize.BOOLEAN,
      },
      buddies: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      token: {
        type: Sequelize.TEXT,
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
      },
      userAccessModules: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  Users.beforeCreate(async (user, options) => {
    if (user.password) {
      let hashPassword = await bcrypt.hash(user.password, 8);
      user.password = hashPassword;
    } else {
      user.password = null;
    }

    if (user.googleId) {
      let hashPassword = await bcrypt.hash(user.googleId, 8);
      user.googleId = hashPassword;
    } else {
      user.googleId = null;
    }

    if (user.facebookId) {
      let hashPassword = await bcrypt.hash(user.facebookId, 8);
      user.facebookId = hashPassword;
    } else {
      user.facebookId = null;
    }

    if (user.phoneId) {
      let hashPassword = await bcrypt.hash(user.phoneId, 8);
      user.phoneId = hashPassword;
    } else {
      user.phoneId = null;
    }
  });
  return Users;
};
