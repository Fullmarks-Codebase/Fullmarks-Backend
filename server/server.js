/* module import */
const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const db = require("./db");
const app = express();
const AWS = require("aws-sdk");
var admin = require("firebase-admin");
const fs = require("fs");
const compression = require("compression");

// Compress Http requests
app.use(compression());

/* socket.io */
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("./routes/application/socket/live")(io);
const demoIo = io.of("/demo");
require("./routes/application/socket/demo")(demoIo);

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

console.log("AWS Setup");
const AWS_ACCESS_ID = process.env.AWS_ACCESS_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
AWS.config.update({
  accessKeyId: AWS_ACCESS_ID,
  secretAccessKey: AWS_SECRET_KEY,
});
const s3 = new AWS.S3();
app.set("s3", s3);
// console.log("LOCAL STORAGE");

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
app.use(express.json());

/* intialize database */
db.sequelize.authenticate();
db.sequelize
  .sync({ logging: false, alter: true })
  .then(async () => {
    await db.sequelize.query(`set global sql_mode=''`);
    console.log("Database Connected!");
  })
  .catch((err) => console.log("ERROR=>>" + err));

/* routes */

require("./routes")(app);

app.get("/socket-io/live", (req, res) => {
  index = fs.readFileSync(__dirname + "/index.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(index);
});

app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "client", "client", "build", "index.html")
  );
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}....`);
});
