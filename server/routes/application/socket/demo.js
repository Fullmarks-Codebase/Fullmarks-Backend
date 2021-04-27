const { Op } = require("sequelize");
const db = require("../../../db");
const Friend = db.friends;
const CustomerLiveQuiz = db.customerLiveQuiz;
const Lobby = db.lobby;
const randomRoom = require("../../../utils/randomOtp");

function client(socket) {
  this.id = socket.id;
  this.state = "newly Connected";
  this.clientSocket = socket;
  this.LobbyArr = [];

  this.changeState = function (newState) {
    this.state = newState;
  };

  this.addLobby = function (lobbyId) {
    this.LobbyArr.push(lobbyId);
  };
}

function sendTime(io, room, participants, question) {
  io.to(room).emit("question", {
    question,
    message: new Date().toJSON(),
    participants,
  });
}

function setIntervalX(callback, delay, repetitions) {
  var x = 0;
  var intervalID = global.setInterval(function () {
    callback();
    if (++x === repetitions) {
      global.clearInterval(intervalID);
    }
  }, delay);
}

let users = {};
let duelNames = [];
var duel = new Map();

module.exports = (io) => {
  try {
    /*---------------------FixSubject / Custom Quiz ------------------------ */
    /* 
    - Reconnect User if try to reconnect.
    - User can join quiz in the middle of session.
    - Question will be thrown every 5 seconds.
    */
    const limit = 2;
    io.on("connection", function (socket) {
      socket.on("room", async ({ room, id, userObj }) => {
        if (!id) {
          io.in(socket.id).emit("Error", "Need User Id");
          return;
        }

        if (!room) {
          io.in(socket.id).emit("Error", "Need Room Id");
          return;
        }

        //check room exist or not
        const roomExist = await CustomerLiveQuiz.findOne({ where: { room } });

        //check if user reconnecting or not
        const checkReconnect = await db.playing.findOne({
          where: {
            userId: userObj.id,
            room: room,
            roomMasterId: roomExist.id,
          },
        });

        //if reconnecting then update it's socket.id and join them
        if (checkReconnect) {
          await db.playing.update(
            { socket_id: socket.id },
            {
              where: {
                userId: userObj.id,
                room: room,
                roomMasterId: roomExist.id,
              },
            }
          );
        }

        // new user then check user is trying to join already started quiz.
        if (!checkReconnect) {
          if (!roomExist) {
            io.in(socket.id).emit("Error", "Room do not exist");
            return;
          }
          //checking game is started and reconnected user was playing then join in room.
          if (parseInt(roomExist.started) === 1) {
            socket.join(room);
          } else if (parseInt(roomExist.started) === 1) {
            io.in(socket.id).emit("Error", "Quiz Already Started");
            return;
          }
        }

        socket.join(room);

        if (
          io.adapter.rooms[room] &&
          io.adapter.rooms[room].length > 1 &&
          roomExist.userId !== parseInt(id) //ignore owner of room compare to himself as friend
        ) {
          let user = await Friend.findOne({
            where: {
              [Op.or]: [
                { fromId: roomExist.userId, toId: id },
                { toId: roomExist.userId, fromId: id },
              ],
            },
          });

          if (!user) {
            io.in(socket.id).emit("Error", "You are not friend with host.");
            return;
          }
        }

        // clearTimeout(socket.inactivityTimeout);
        // socket.inactivityTimeout = setTimeout(async () => {
        //   users[room] = users[room].filter(
        //     (i) => i.user.socket_id !== socket.id
        //   );
        //   socket.to(room).emit("inactive_lobby", {
        //     message:
        //       "Due to inactivity for long time, Room is removed. Re-enter inside room",
        //   });
        //   socket.disconnect(true);
        // }, 1000 * 60 * 10); //10 minute lobby waiting else socket will disconnect users.

        if (io.adapter.rooms[room] && io.adapter.rooms[room].length > limit) {
          io.in(socket.id).emit("session_full", {
            message: "Full Lobby",
            participants: io.adapter.rooms[room].length,
          });
        } else {
          let questions = await db.customerLiveQuizQuestions.findAll({
            where: {
              userRoomId: roomExist.id,
            },
            attributes: [],
            include: [
              {
                model: db.questions,
                as: "fix_question",
                required: false,
              },
              {
                model: db.customQuestions,
                as: "custom_question",
                required: false,
              },
            ],
          });

          const checkIfUserRejoin = await db.playing.findOne({
            where: {
              userId: userObj.id,
              submitted: 0,
              roomMasterId: roomExist.id,
            },
          });

          if (!checkIfUserRejoin) {
            await db.playing.create({
              roomMasterId: roomExist.id,
              userId: userObj.id,
              socket_id: socket.id,
              room: room,
            });
          }

          socket.emit("welcome", {
            message: "Welcome! " + userObj.username || null,
            participants: io.adapter.rooms[room].length,
            room: roomExist,
            questions,
          });

          socket.on("active", () => {
            clearTimeout(socket.inactivityTimeout);
            socket.inactivityTimeout = setTimeout(async () => {
              const leavingUser = await db.users.findOne({
                where: {
                  id: userObj.id,
                },
              });
              await db.playing.destroy({
                where: { userId: leavingUser.id, room: room },
              });
              io.sockets.to(room).emit("disconnected", {
                message:
                  "User Disconnected: " +
                  (leavingUser ? leavingUser.username : socket.id),
                participants:
                  (io.adapter.rooms[room] && io.adapter.rooms[room].length) ||
                  0,
              });
              socket.disconnect(true);
            }, 1000 * 10); // 2 minute / TESTING-10SECS
          });

          socket.to(room).emit("join", {
            message: "User Joined: " + userObj.username,
            participants: io.adapter.rooms[room].length,
          });

          socket.on("start_quiz", async () => {
            const participants = io.adapter.rooms[room].length;
            io.in(room).emit("GetReady", {
              participants,
              message: "Quiz starting in",
            });
            await db.customerLiveQuiz.update(
              { started: 1 },
              { where: { room } }
            );
            await db.playing.update(
              { status: 1 },
              { where: { room: room, roomMasterId: roomExist.id } }
            );

            async function sleep(millis) {
              return new Promise((resolve) => setTimeout(resolve, millis));
            }

            for (const { fix_question, custom_question } of questions) {
              io.in(room).emit("question", {
                participants: io.adapter.rooms[room].length,
                question: custom_question ? custom_question : fix_question,
                time: custom_question ? custom_question.time : 10000,
              });
              custom_question
                ? await sleep(custom_question.time * 1000)
                : await sleep(10000);
            }
            // var time = 5000;

            // var interval = setTimeout(foo, time);
            // function foo() {
            //   io.in(room).emit("question", {
            //     participants,
            //     question: questions[iterations],
            //     time: time,
            //   });
            //   iterations++;
            //   if (iterations >= questions.length) clearInterval(interval);
            // }
          });

          socket.on("userDetails", async () => {
            setInterval(async () => {
              const allParticipants = await db.playing.findAll({
                where: {
                  room: room,
                  roomMasterId: roomExist.id,
                },
                include: [
                  {
                    model: db.users,
                    as: "user",
                    required: false,
                  },
                ],
                attributes: [
                  "id",
                  ["points", "score"],
                  "socket_id",
                  "submitted",
                ],
              });
              socket.emit("allParticipants", {
                users: allParticipants,
                participants:
                  (io.adapter.rooms[room] && io.adapter.rooms[room].length) ||
                  0,
              });
            }, 5000);
          });

          socket.on("updateScore", async (data) => {
            await db.playing.update(
              {
                points: db.sequelize.literal(`points + ${data.point}`),
              },
              { where: { userId: data.id, submitted: false } }
            );
          });

          socket.on("submit", async () => {
            await db.playing.update(
              { submitted: true },
              { where: { userId: userObj.id, roomMasterId: roomExist.id } }
            );
            const unSubmitUser = await db.playing.findAll({
              where: {
                room: room,
                roomMasterId: roomExist.id,
                submitted: false,
              },
              include: [
                {
                  model: db.users,
                  as: "user",
                  required: false,
                  attributes: [
                    "id",
                    "username",
                    "userProfileImage",
                    "thumbnail",
                  ],
                },
              ],
              attributes: ["id", ["points", "score"], "socket_id", "submitted"],
            });

            let unSubmitted = unSubmitUser.map((i) => {
              return i.user.username;
            });

            if (unSubmitted.length > 0) {
              io.in(room).emit("notSubmitted", {
                message: unSubmitted.toString() + "'s answer remain to submit",
              });
            } else {
              io.in(room).emit("completed", {
                message: "Success",
              });
            }
            // delete user if submit
            await db.playing.destroy({
              where: { userId: userObj.id, roomMasterId: roomExist.id },
            });
          });

          socket.on("forceDisconnect", async (data) => {
            let numberOfUser = 0;
            const leavingUser = await db.users.findOne({
              where: {
                id: data.userObj.id,
              },
            });
            if (io.adapter.rooms[room])
              numberOfUser =
                (io.adapter.rooms[room] && io.adapter.rooms[room].length) || 0;

            await db.playing.destroy({ where: { socket_id: socket.id } });
            io.in(room).emit("disconnected", {
              message:
                "User Disconnected: " +
                (leavingUser ? leavingUser.username : socket.id),
              participants: numberOfUser,
            });
          });

          socket.on("disconnect", async () => {
            let numberOfUser = 0;
            const leavingUser = await db.users.findOne({
              where: {
                id: userObj.id,
              },
            });
            if (io.adapter.rooms[room])
              numberOfUser =
                (io.adapter.rooms[room] && io.adapter.rooms[room].length) || 0;

            await db.playing.destroy({ where: { socket_id: socket.id } });
            io.in(room).emit("disconnected", {
              message:
                "User Disconnected: " +
                (leavingUser ? leavingUser.username : socket.id),
              participants: numberOfUser,
            });
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};
