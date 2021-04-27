const Sequelize = require("sequelize");
const dbConfig = require("./config");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: "mysql",
  define: {
    charset: "utf8",
    collate: "utf8_general_ci",
  },
  ssl: {
    ssl: process.env.NODE_ENV ? "Amazon RDS" : null,
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/*----------------- Creating Tables ---------------*/

db.users = require("./models/user.js")(sequelize, Sequelize);
db.subjects = require("./models/subjects")(sequelize, Sequelize);
db.topics = require("./models/topics")(sequelize, Sequelize);
db.questions = require("./models/questions")(sequelize, Sequelize);
db.mockMaster = require("./models/mockMaster")(sequelize, Sequelize);
db.mockQuestions = require("./models/mockQuestion")(sequelize, Sequelize);
db.customerLiveQuiz = require("./models/liveQuiz/customerLiveQuiz")(
  sequelize,
  Sequelize
);
db.customerLiveQuizQuestions = require("./models/liveQuiz/customerLiveQuizQuestions")(
  sequelize,
  Sequelize
);
db.customQuestionsMaster = require("./models/liveQuiz/customQuestionsMaster")(
  sequelize,
  Sequelize
);
db.customQuestions = require("./models/liveQuiz/customQuestions")(
  sequelize,
  Sequelize
);

db.posts = require("./models/discussionForum/posts")(sequelize, Sequelize);
db.likeHistory = require("./models/discussionForum/discussionLikesHistory")(
  sequelize,
  Sequelize
);
db.savedHistory = require("./models/discussionForum/discussionSavedHistory")(
  sequelize,
  Sequelize
);
db.commentHistory = require("./models/discussionForum/discussionCommentsHistory")(
  sequelize,
  Sequelize
);
db.commentLikeHistory = require("./models/discussionForum/discussionCommentLikesHistory")(
  sequelize,
  Sequelize
);
db.sets = require("./models/sets")(sequelize, Sequelize);
db.class = require("./models/class")(sequelize, Sequelize);
db.reportMaster = require("./models/reportMaster")(sequelize, Sequelize);
db.reports = require("./models/report")(sequelize, Sequelize);
db.notifications = require("./models/notificationHistory")(
  sequelize,
  Sequelize
);
db.fixSubject = require("./models/fixSubject")(sequelize, Sequelize);
db.guest = require("./models/guest")(sequelize, Sequelize);

db.friends = require("./models/friends")(sequelize, Sequelize);
db.liveQuizReport = require("./models/liveQuiz/live_quiz_reports")(
  sequelize,
  Sequelize
);
db.liveQuizReportMasters = require("./models/liveQuiz/live_quiz_report_masters")(
  sequelize,
  Sequelize
);

db.lobby = require("./models/liveQuiz/lobby")(sequelize, Sequelize);

db.playing = require("./models/liveQuiz/playing")(sequelize, Sequelize);

db.postImages = require("./models/discussionForum/postImages")(
  sequelize,
  Sequelize
);
db.commentImages = require("./models/discussionForum/commentImages")(
  sequelize,
  Sequelize
);

db.mockReportMaster = require("./models/mockTest/mockReportMaster")(
  sequelize,
  Sequelize
);
db.mockReport = require("./models/mockTest/mockReport")(sequelize, Sequelize);
db.updateRecord = require("./models/liveQuiz/updateRecord")(
  sequelize,
  Sequelize
);

/*-----------------Setting Foriegn Keys---------------*/

//subjects
db.subjects.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });

//topics
db.topics.belongsTo(db.subjects, { as: "subject", onDelete: "CASCADE" });
db.topics.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });

//sets
db.sets.belongsTo(db.topics, { as: "topic", onDelete: "CASCADE" });
db.sets.belongsTo(db.subjects, { as: "subject", onDelete: "CASCADE" });
db.sets.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });

//questions
db.questions.belongsTo(db.subjects, { as: "subject", onDelete: "CASCADE" });
db.questions.belongsTo(db.topics, { as: "topic", onDelete: "CASCADE" });
db.questions.belongsTo(db.sets, { as: "set", onDelete: "CASCADE" });
db.questions.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });

db.sets.hasMany(db.questions, { foreignKey: "setId", as: "question" });
db.subjects.hasMany(db.topics, { foreignKey: "subjectId", as: "topics" });
db.subjects.hasMany(db.sets, { foreignKey: "subjectId", as: "sets" });
db.subjects.hasMany(db.questions, { foreignKey: "subjectId", as: "question" });
db.subjects.hasMany(db.posts, { foreignKey: "subjectId", as: "post" });
db.topics.hasMany(db.sets, { foreignKey: "subjectId", as: "sets" });
db.topics.hasMany(db.questions, { foreignKey: "topicId", as: "topic" });
db.topics.hasMany(db.questions, { foreignKey: "topicId", as: "question" });

//mockquestion
db.mockQuestions.belongsTo(db.mockMaster, { as: "mock", onDelete: "CASCADE" });
db.mockQuestions.belongsTo(db.fixSubject, {
  as: "fix_subject",
  onDelete: "CASCADE",
});

db.mockMaster.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });
db.mockMaster.hasMany(db.mockQuestions, {
  foreignKey: "mockId",
  as: "questions",
});
db.class.hasMany(db.mockMaster, { foreignKey: "classId", as: "mock" });

//customerLiveQuiz
db.customerLiveQuiz.belongsTo(db.users, {
  as: "user",
  onDelete: "CASCADE",
});
db.customerLiveQuizQuestions.belongsTo(db.customerLiveQuiz, {
  as: "userRoom",
  onDelete: "CASCADE",
});

db.customerLiveQuizQuestions.belongsTo(db.questions, { as: "fix_question" });
db.customerLiveQuizQuestions.belongsTo(db.customQuestions, {
  as: "custom_question",
});

//customQustionsMaster
db.customQuestionsMaster.belongsTo(db.class, {
  as: "class",
  onDelete: "CASCADE",
});

//customQuestions
db.customQuestionsMaster.belongsTo(db.users, {
  as: "user",
  onDelete: "CASCADE",
});
db.customQuestions.belongsTo(db.customQuestionsMaster, {
  as: "customMaster",
  onDelete: "CASCADE",
});

db.customQuestions.belongsTo(db.users, {
  as: "user",
  onDelete: "CASCADE",
});

db.customQuestionsMaster.hasMany(db.customQuestions, {
  foreignKey: "customMasterId",
  as: "questions",
});
db.users.hasMany(db.customQuestionsMaster, {
  foreignKey: "userId",
  as: "customSet",
});
db.users.hasMany(db.customQuestions, {
  foreignKey: "userId",
  as: "customQuestion",
});

//post
db.posts.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.posts.belongsTo(db.subjects, { as: "subject" });
db.users.hasMany(db.posts, { foreignKey: "userId", as: "user" });
db.users.hasMany(db.posts, { foreignKey: "userId", as: "posts" });

//like
db.likeHistory.belongsTo(db.posts, { as: "post", onDelete: "CASCADE" });
db.likeHistory.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.posts.hasMany(db.likeHistory, { foreignKey: "postId", as: "like" });

//bookmarked or saved
db.savedHistory.belongsTo(db.posts, { as: "post", onDelete: "CASCADE" });
db.savedHistory.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.posts.hasMany(db.savedHistory, { foreignKey: "postId", as: "saved" });

//comments
db.commentHistory.belongsTo(db.posts, { as: "post", onDelete: "CASCADE" });
db.commentHistory.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.users.hasMany(db.commentHistory, { foreignKey: "userId", as: "comment" });

//commentLikes
db.commentLikeHistory.belongsTo(db.commentHistory, {
  as: "comment",
  onDelete: "CASCADE",
});
db.commentLikeHistory.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.commentLikeHistory.belongsTo(db.posts, { as: "post", onDelete: "CASCADE" });
db.commentHistory.hasMany(db.commentLikeHistory, {
  foreignKey: "commentId",
  as: "like",
});

//report masters
db.reportMaster.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.reportMaster.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });
db.reportMaster.belongsTo(db.subjects, { as: "subject", onDelete: "CASCADE" });
db.reportMaster.belongsTo(db.topics, { as: "topic", onDelete: "CASCADE" });
db.reportMaster.belongsTo(db.sets, { as: "set", onDelete: "CASCADE" });
db.sets.hasMany(db.reportMaster, { foreignKey: "setId", as: "submitted" });
db.users.hasMany(db.reportMaster, { foreignKey: "userId", as: "reportSet" });

//report
db.reports.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.reports.belongsTo(db.class, { as: "class", onDelete: "CASCADE" });
db.reports.belongsTo(db.subjects, { as: "subject", onDelete: "CASCADE" });
db.reports.belongsTo(db.topics, { as: "topic", onDelete: "CASCADE" });
db.reports.belongsTo(db.sets, { as: "set", onDelete: "CASCADE" });
db.reports.belongsTo(db.questions, { as: "question", onDelete: "CASCADE" });
db.reports.belongsTo(db.reportMaster, { as: "report", onDelete: "CASCADE" });

db.questions.hasMany(db.reports, {
  foreignKey: "questionId",
  as: "questionDetail",
});
db.class.hasMany(db.reports, { foreignKey: "classId", as: "classDetail" });
db.subjects.hasMany(db.reports, {
  foreignKey: "subjectId",
  as: "subjectDetail",
});
db.topics.hasMany(db.reports, { foreignKey: "topicId", as: "topicDetail" });
db.sets.hasMany(db.reports, { foreignKey: "setId", as: "setDetail" });
db.users.hasMany(db.reports, { foreignKey: "userId", as: "userDetail" });
db.reportMaster.hasMany(db.reports, {
  foreignKey: "reportId",
  as: "reportDetail",
});

//notification
db.notifications.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.users.hasMany(db.notifications, {
  foreignKey: "userId",
  as: "notification",
});

db.friends.belongsTo(db.users, { as: "from", onDelete: "CASCADE" });
db.friends.belongsTo(db.users, { as: "to", onDelete: "CASCADE" });
db.users.hasMany(db.friends, { foreignKey: "fromId", as: "from" });
db.users.hasMany(db.friends, { foreignKey: "toId", as: "to" });

// live
db.liveQuizReport.belongsTo(db.liveQuizReportMasters, {
  as: "report",
  onDelete: "CASCADE",
});
db.liveQuizReport.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.liveQuizReport.belongsTo(db.subjects, {
  as: "subject",
  onDelete: "CASCADE",
});
db.liveQuizReport.belongsTo(db.questions, {
  as: "question",
  onDelete: "CASCADE",
});
db.liveQuizReport.belongsTo(db.customQuestionsMaster, {
  as: "customMaster",
  onDelete: "CASCADE",
});
db.liveQuizReport.belongsTo(db.customQuestions, {
  as: "customQuestion",
  onDelete: "CASCADE",
});

db.liveQuizReportMasters.hasMany(db.liveQuizReport, {
  foreignKey: "reportId",
  as: "questions",
});
db.users.hasMany(db.liveQuizReport, { foreignKey: "userId", as: "liveReport" });
db.subjects.hasMany(db.liveQuizReport, {
  foreignKey: "subjectId",
  as: "liveReport",
});

db.questions.hasMany(db.liveQuizReport, {
  foreignKey: "questionId",
  as: "liveReport",
});
db.customQuestionsMaster.hasMany(db.liveQuizReport, {
  foreignKey: "customMasterId",
  as: "customMasterSet",
});
db.customerLiveQuizQuestions.hasMany(db.liveQuizReport, {
  foreignKey: "customQuestionId",
  as: "customQuestions",
});

//live master
db.liveQuizReportMasters.belongsTo(db.customerLiveQuiz, {
  as: "room",
  onDelete: "CASCADE",
});

db.liveQuizReportMasters.belongsTo(db.users, {
  as: "user",
  onDelete: "CASCADE",
});
db.liveQuizReportMasters.belongsTo(db.subjects, {
  as: "subject",
  onDelete: "CASCADE",
});
db.liveQuizReportMasters.belongsTo(db.customQuestionsMaster, {
  as: "customMaster",
  onDelete: "CASCADE",
});

db.liveQuizReportMasters.belongsTo(db.class, { as: "class" });

db.class.hasMany(db.liveQuizReportMasters, {
  foreignKey: "classId",
  as: "reports",
});

db.users.hasMany(db.liveQuizReportMasters, {
  foreignKey: "userId",
  as: "reportMaster",
});
db.subjects.hasMany(db.liveQuizReportMasters, {
  foreignKey: "subjectId",
  as: "subjects",
});
db.customQuestionsMaster.hasMany(db.liveQuizReportMasters, {
  foreignKey: "customMasterId",
  as: "customMaster",
});
db.customerLiveQuiz.hasMany(db.liveQuizReportMasters, {
  foreignKey: "roomId",
  as: "roomdetail",
});

//lobby
db.lobby.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.lobby.belongsTo(db.subjects, { as: "subject", onDelete: "CASCADE" });
db.lobby.belongsTo(db.class, { as: "class" });

db.users.hasMany(db.lobby, { foreignKey: "userId", as: "lobby" });
db.subjects.hasMany(db.lobby, { foreignKey: "subjectId", as: "lobby" });
db.class.hasMany(db.lobby, { foreignKey: "classId", as: "lobby" });

db.playing.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.playing.belongsTo(db.customerLiveQuiz, { as: "roomMaster" });
db.playing.belongsTo(db.questions, { as: "question" });
db.playing.belongsTo(db.customQuestions, { as: "customQuestion" });

db.postImages.belongsTo(db.posts, { as: "post", onDelete: "CASCADE" });
db.posts.hasMany(db.postImages, { foreignKey: "postId", as: "post_images" });

db.commentImages.belongsTo(db.commentHistory, {
  as: "comment",
  onDelete: "CASCADE",
});
db.commentHistory.hasMany(db.commentImages, {
  foreignKey: "commentId",
  as: "comment_images",
});

db.commentImages.belongsTo(db.posts, { as: "post", onDelete: "CASCADE" });

//result
db.mockReportMaster.belongsTo(db.mockMaster, {
  as: "mock",
  onDelete: "CASCADE",
});
db.mockReportMaster.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.users.hasMany(db.mockReportMaster, {
  foreignKey: "userId",
  as: "mockReportMaster",
});
db.mockMaster.hasMany(db.mockReportMaster, {
  foreignKey: "mockId",
  as: "mockMaster",
});

//answers

db.mockReport.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.mockReport.belongsTo(db.mockReportMaster, {
  as: "mockReportMaster",
  onDelete: "CASCADE",
});
db.mockReport.belongsTo(db.mockQuestions, {
  as: "question",
  onDelete: "CASCADE",
});

db.mockReport.belongsTo(db.mockMaster, { as: "mock", onDelete: "CASCADE" });
db.mockReportMaster.hasMany(db.mockReport, {
  foreignKey: "mockReportMasterId",
  as: "questions",
});

db.mockQuestions.hasMany(db.mockReport, {
  foreignKey: "questionId",
  as: "questions",
});

db.updateRecord.belongsTo(db.users, { as: "user", onDelete: "CASCADE" });
db.updateRecord.belongsTo(db.customerLiveQuiz, {
  as: "room",
  onDelete: "CASCADE",
});
db.updateRecord.belongsTo(db.questions, {
  as: "question",
  onDelete: "CASCADE",
});

db.updateRecord.belongsTo(db.customQuestions, {
  as: "customQuestion",
  onDelete: "CASCADE",
});

// db.users.hasMany(db.mockReport, { foreignKey: "userId", as: "mockReport" });
// db.mockReportMaster.hasMany(db.mockReport, {
//   foreignKey: "mockReportMasterId",
//   as: "mockReportMaster",
// });

// db.users.hasMany(db.playing, { foreignKey: "userId", as: "user" });
// db.customerLiveQuiz.hasMany(db.playing, {
//   foreignKey: "roomMasterId",
//   as: "roomDetail",
// });
// db.questions.hasMany(db.playing, { foreignKey: "questionId", as: "question" });
// db.customQuestions.hasMany(db.playing, {
//   foreignKey: "customQuestionId",
//   as: "custom_question",
// });

module.exports = db;
