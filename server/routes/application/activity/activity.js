var cron = require("node-cron");
const db = require("./../../../db");

//delete every records after 5min
cron.schedule("*/5 * * * *", async () => {
  console.log("running a task every 5 minute");
  try {
    await db.sequelize.query(
      "delete from lobbies where TIMESTAMPDIFF(second, lobbies.createdAt, now()) > 300"
    );
    await db.sequelize.query(
      "delete from playings where TIMESTAMPDIFF(second, playings.createdAt, now()) > 300"
    );
  } catch (err) {
    console.log(err);
  }
});
