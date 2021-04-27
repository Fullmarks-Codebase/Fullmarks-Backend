const { Op } = require("sequelize");
const db = require("../../../db");
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
    const limit = 10;
    io.on("connection", function (socket) {
      socket.on("room", async ({ room, id, userObj }) => {
        if (!id) {
          io.sockets.in(socket.id).emit("Error", "Need User Id");
          return;
        }

        if (!room) {
          io.sockets.in(socket.id).emit("Error", "Need Room Id");
          return;
        }

        //check room exist or not
        const roomExist = await CustomerLiveQuiz.findOne({ where: { room } });
        if (!roomExist) {
          io.sockets.in(socket.id).emit("Error", "Room do not exist");
          return;
        }

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
            io.sockets.in(socket.id).emit("Error", "Room do not exist");
            return;
          }
        }

        socket.join(room);

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

        if (
          io.sockets.adapter.rooms[room] &&
          io.sockets.adapter.rooms[room].length > limit
        ) {
          io.sockets.in(socket.id).emit("session_full", {
            message: "Full Lobby",
            participants: io.sockets.adapter.rooms[room].length,
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
              status: 1,
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
            participants: io.sockets.adapter.rooms[room].length,
            room: roomExist,
            question: questions,
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
                  (io.sockets.adapter.rooms[room] &&
                    io.sockets.adapter.rooms[room].length) ||
                  0,
              });

              socket.disconnect(true);
            }, 1000 * 2); // 2 minute / TESTING-10SECS
          });

          socket.to(room).emit("join", {
            message: "User Joined: " + userObj.username,
            participants: io.sockets.adapter.rooms[room].length,
          });

          socket.on("start_quiz", async () => {
            var iterations = 0;
            const participants = io.sockets.adapter.rooms[room].length;
            io.sockets
              .in(room)
              .emit("GetReady", { participants, message: "Quiz starting in" });
            await db.customerLiveQuiz.update(
              { started: 1 },
              { where: { room } }
            );
            await db.playing.update(
              { status: 1 },
              { where: { room: room, roomMasterId: roomExist.id } }
            );
            var interval = setInterval(foo, 5000);
            function foo() {
              io.sockets.in(room).emit("question", {
                participants,
                question: questions[iterations],
              });
              iterations++;
              if (iterations >= questions.length) clearInterval(interval);
            }
          });

          socket.on("userDetails", async () => {
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
              attributes: ["id", ["points", "score"], "socket_id", "submitted"],
            });

            socket.emit("allParticipants", {
              users: allParticipants,
              participants: io.sockets.adapter.rooms[room].length,
            });
          });

          socket.on("updateScore", async (data) => {
            await db.playing.update(
              {
                points: db.sequelize.literal(`points + ${data.point}`),
              },
              { where: { userId: data.id, submitted: false } }
            );
          });

          socket.on("check", async () => {
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
              io.sockets.in(room).emit("notSubmitted", {
                message: unSubmitted.toString() + "'s answer remain to submit",
              });
            } else {
              await db.playing.destroy({
                where: { userId: userObj.id, roomMasterId: roomExist.id },
              });
              io.sockets.in(room).emit("completed", {
                message: "Success",
              });
            }
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
              io.sockets.in(room).emit("notSubmitted", {
                message: unSubmitted.toString() + "'s answer remain to submit",
              });
            } else {
              io.sockets.in(room).emit("completed", {
                message: "Success",
              });
            }
          });

          socket.on("forceDisconnect", async (data) => {
            let numberOfUser = 0;
            const leavingUser = await db.users.findOne({
              where: {
                id: data.userObj.id,
              },
            });
            if (io.sockets.adapter.rooms[room])
              numberOfUser =
                (io.sockets.adapter.rooms[room] &&
                  io.sockets.adapter.rooms[room].length) ||
                0;

            await db.playing.destroy({ where: { socket_id: socket.id } });
            io.sockets.in(room).emit("disconnected", {
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
            if (io.sockets.adapter.rooms[room])
              numberOfUser =
                (io.sockets.adapter.rooms[room] &&
                  io.sockets.adapter.rooms[room].length) ||
                0;

            await db.playing.destroy({ where: { socket_id: socket.id } });
            io.sockets.in(room).emit("disconnected", {
              message:
                "User Disconnected: " +
                (leavingUser ? leavingUser.username : socket.id),
              participants: numberOfUser,
            });
          });
        }
      });
    });

    /*------------------------------ Duel ---------------------------------- */
    let DS = io.of("/random");
    DS.on("connection", function (socket) {
      const roomNumber = randomRoom();
      var searchingInterval;
      socket.on("choose", async ({ users, data }) => {
        var checkReconnect = await Lobby.findOne({
          where: {
            userId: users.id,
            subjectId: data.subjectId,
            classId: data.classId,
            completed: 0,
          },
        });

        let createNewUser = checkReconnect;
        if (checkReconnect) {
          await Lobby.update(
            { socket_id: socket.id },
            {
              where: {
                userId: users.id,
                subjectId: data.subjectId,
                classId: data.classId,
                completed: 0,
              },
            }
          );
          checkReconnect = await Lobby.findOne({
            where: {
              userId: users.id,
              subjectId: data.subjectId,
              classId: data.classId,
              completed: 0,
            },
          });
          createNewUser = checkReconnect;
        }

        if (createNewUser && parseInt(createNewUser.status) === 1) {
          //
          /* user is playing quiz as status is 1 */
          //
        } else {
          //
          /* Check if current user already present in waiting list */
          //
          const ifCurrentUserPresent = await Lobby.findOne({
            where: {
              userId: users.id,
              socket_id: socket.id,
              subjectId: data.subjectId,
              classId: data.classId,
              completed: 0,
            },
          });
          let ifCurrentUserPlaying = null;
          if (!ifCurrentUserPresent) {
            //
            /* not user found in waiting list so, add new user/present socket in waiting list */
            //
            createNewUser = await Lobby.create({
              userId: users.id,
              room: roomNumber,
              socket_id: socket.id,
              subjectId: data.subjectId,
              classId: data.classId,
              completed: 0,
            });
          }
          //
          //user is not playing quiz or it is new user to join the connection and search for new opponent in 3 secs.
          //
          searchingInterval = setInterval(async () => {
            ifCurrentUserPlaying = await Lobby.findOne({
              where: {
                userId: users.id,
                socket_id: socket.id,
                subjectId: data.subjectId,
                classId: data.classId,
                status: 1,
                completed: 0,
              },
            });
            if (ifCurrentUserPlaying) {
              clearInterval(searchingInterval);
              return;
            }
            const waitingPlayers = await Lobby.findOne({
              where: {
                subjectId: data.subjectId,
                classId: data.classId,
                socket_id: {
                  [Op.ne]: socket.id,
                },
                status: 0,
                completed: 0,
              },
            });

            //
            /* check if any player is in waiting list */
            //
            if (waitingPlayers) {
              var waitingPlayerSocket = DS.sockets[waitingPlayers.socket_id];
              //
              /* Check if waiting user is still online and if not, then add new user to waiting user. */
              //
              if (
                !DS.connected[waitingPlayers.socket_id] &&
                !ifCurrentUserPresent
              ) {
                await Lobby.create({
                  ...data,
                  userId: users.id,
                  socket_id: socket.id,
                  room: roomNumber,
                });
                await Lobby.destroy({ where: { id: waitingPlayers.id } });
              }
              //
              /* if waiting user is online, join new user and waiting user */
              //
              else {
                clearInterval(searchingInterval);
                await Lobby.update(
                  { status: 1, room: waitingPlayers.room },
                  {
                    where: {
                      socket_id: {
                        [Op.in]: [waitingPlayers.socket_id, socket.id],
                      },
                    },
                  }
                );
                socket.join(waitingPlayers.room);
                waitingPlayerSocket.join(waitingPlayers.room);

                const questions = await db.questions.findAll({
                  where: { subjectId: data.subjectId },
                  limit: 10,
                  order: db.sequelize.literal("rand()"),
                });

                const customer = await CustomerLiveQuiz.create({
                  userId: users.id,
                  room: waitingPlayers.room,
                });

                let questionsRef = [];
                for (let i = 0; i < 10; i++) {
                  let temp = {};
                  temp["userRoomId"] = customer.id;
                  temp["fixQuestionId"] = questions[i].id;
                  questionsRef.push(temp);
                }

                await db.customerLiveQuizQuestions.bulkCreate(questionsRef);

                DS.to(waitingPlayers.room).emit("welcome", {
                  message: "Welcome!",
                  participants: 2,
                  room: waitingPlayers.room,
                  questions,
                  roomId: customer.id,
                });
              }
            }
          }, 3000);
        }

        socket.on("updateScore", async (data) => {
          await Lobby.update(
            {
              points: db.sequelize.literal(`points + ${data.points}`),
            },
            { where: { userId: data.id, room: roomNumber, completed: 0 } }
          );
        });

        socket.on("userDetails", async (data) => {
          let users = await Lobby.findAll({
            where: {
              room: data.room,
            },
            include: [
              {
                model: db.users,
                as: "user",
                required: false,
                attributes: ["id", "username", "userProfileImage", "thumbnail"],
              },
            ],
          });

          DS.to(data.room).emit("allParticipants", {
            users: users,
          });
        });

        socket.on("active", (data) => {
          console.log(data);
          clearTimeout(socket.inactivityTimeout);
          socket.inactivityTimeout = setTimeout(async () => {
            const leavingUser = await db.users.findOne({
              where: {
                id: users.id,
              },
            });
            await Lobby.destroy({
              where: { userId: leavingUser.id, room: data.room },
            });

            const online = await Lobby.findAll({
              where: {
                room: data.room,
              },
            });

            DS.to(data.room).emit("welcome", {
              message:
                "User Disconnected: " +
                (leavingUser ? leavingUser.username : socket.id),
              participants: online.length,
            });

            socket.disconnect(true);
          }, 1000 * 10); // 2 minute
        });

        socket.on("submit", async () => {
          const roomInfo = await Lobby.findOne({
            userId: users.id,
            subjectId: data.subjectId,
            classId: data.classId,
            completed: 0,
            status: 1,
          });
          await Lobby.update(
            { completed: 1 },
            {
              where: {
                userId: users.id,
                subjectId: data.subjectId,
                classId: data.classId,
                completed: 0,
                status: 1,
                room: roomInfo.room,
              },
            }
          );
          const unSubmitUser = await Lobby.findAll({
            where: {
              room: roomInfo.room,
              classId: data.classId,
              subjectId: data.subjectId,
              completed: 0,
              status: 1,
            },
            include: [
              {
                model: db.users,
                as: "user",
                required: false,
                attributes: ["id", "username", "userProfileImage", "thumbnail"],
              },
            ],
            attributes: ["id", ["points", "score"], "socket_id", "completed"],
          });

          let unSubmitted = unSubmitUser.map((i) => {
            return i.user.username;
          });

          if (unSubmitted.length > 0) {
            DS.to(roomInfo.room).emit(
              "notSubmitted",
              unSubmitted.toString() + "'s answer remain to submit"
            );
          } else {
            DS.to(roomInfo.room).emit("completed", {
              message: "Success",
            });
          }
        });
      });
      socket.on("forceDisconnect", async () => {
        let users = await Lobby.findOne({
          where: {
            socket_id: socket.id,
          },
          include: [
            {
              model: db.users,
              as: "user",
              required: false,
              attributes: ["id", "username", "userProfileImage", "thumbnail"],
            },
          ],
        });
        if (users)
          DS.to(users.room).emit(
            "disconnected",
            "User Disconnected: " + users.user.username
          );
        await Lobby.destroy({ where: { socket_id: socket.id } });
      });
      socket.on("disconnect", async () => {
        let users = await Lobby.findOne({
          where: {
            socket_id: socket.id,
          },
          include: [
            {
              model: db.users,
              as: "user",
              required: false,
              attributes: ["id", "username", "userProfileImage", "thumbnail"],
            },
          ],
        });
        if (users)
          DS.to(users.room).emit(
            "disconnected",
            "User Disconnected: " + users.user.username
          );
        await Lobby.destroy({ where: { socket_id: socket.id } });
      });
    });
  } catch (error) {
    console.log(error);
  }
};
