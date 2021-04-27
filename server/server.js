/* module import */
const PORT = process.env.PORT || 3001;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const db = require("./db");
const app = express();
const AWS = require("aws-sdk");
var admin = require("firebase-admin");
const fs = require("fs");

/* socket.io */
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("./routes/application/socket/live")(io);

/* firebase analytics */
// const propertyId = 259252954;
// const { AlphaAnalyticsDataClient } = require("@google-analytics/data");
// const client = new AlphaAnalyticsDataClient({
//   email: "reachiapps@gmail.com",
//   keyFilename: "./auth/Fullmarks-018d062b405c.json",
// });

/* env */
require("dotenv").config({
  path: __dirname + "/.env",
});

var serviceAccount = require("./auth/full-marks-app-firebase-adminsdk-fye31-61e52edd30.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://full-marks-app.firebaseio.com",
});

app.set("admin", admin);

if (process.env.NODE_ENV === "production") {
  console.log("AWS Setup");
  const AWS_ACCESS_ID = process.env.AWS_ACCESS_ID;
  const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
  AWS.config.update({
    accessKeyId: AWS_ACCESS_ID,
    secretAccessKey: AWS_SECRET_KEY,
  });
  const s3 = new AWS.S3();
  app.set("s3", s3);
} else {
  console.log("LOCAL STORAGE");
}

/* static folder config */
app.use("/images", express.static(__dirname + "/images"));
app.use(express.static("client/client/build"));

/* network */

app.use(
  cors({
    origin: process.env.REACT_APP_URL,
    credentials: true,
  })
);
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* intialize database */
db.sequelize.authenticate();
db.sequelize
  .sync({ logging: false, alter: true, alter: { drop: false } })
  .then(async () => {
    await db.sequelize.query(
      `SET global sql_mode=(SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''))`
    );
    console.log("Database Connected!");
  })
  .catch((err) => console.log(err));

/* routes */

require("./routes")(app);

/* Socket Testing Html */
app.get("/socket-io/live", (req, res) => {
  index = fs.readFileSync(__dirname + "/index.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(index);
});

/* React Build Server */
app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "client", "client", "build", "index.html")
  );
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}....`);
});
