var cron = require("node-cron");
const db = require("./../../../db");

//delete every records after 15min
cron.schedule("*/15 * * * *", async () => {
  console.log("running a task every 15 minute");
  try {
    await db.sequelize.query(
      "delete from lobbies where TIMESTAMPDIFF(second, lobbies.createdAt, now()) > 900"
    );
    await db.sequelize.query(
      "delete from playings where TIMESTAMPDIFF(second, playings.createdAt, now()) > 900"
    );
    // await db.sequelize.query(`set global sql_mode=''`);
  } catch (err) {
    console.log(err);
  }
});
