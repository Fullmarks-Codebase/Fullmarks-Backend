import AdminChangePassword from "./AdminHandle/Components/AdminChangePassword";
import AdminRegister from "./AdminHandle/Components/AdminRegister";
import AdminTable from "./AdminHandle/Components/AdminTable";
import AdminUpdate from "./AdminHandle/Components/AdminUpdate";

import AddSubject from "./SubjectHandle/Components/AddSubject";
import SubjectTable from "./SubjectHandle/Components/SubjectTable";
import UpdateSubject from "./SubjectHandle/Components/UpdateSubject";

import AddTopic from "./TopicHandle/Components/AddTopic";
import TopicsTable from "./TopicHandle/Components/TopicsTable";
import UpdateTopic from "./TopicHandle/Components/UpdateTopic";

import UserRegister from "./UserHandle/Components/UserRegister";
import UserTable from "./UserHandle/Components/UserTable";
import UserUpdate from "./UserHandle/Components/UserUpdate";

import QuestionsTable from "./QuestionsHandle/Components/QuestionsTable";
import AddQuestion from "./QuestionsHandle/Components/AddQuestion";
import UpdateQuestion from "./QuestionsHandle/Components/UpdateQuestion";

import AddMockQuestion from "./MockQuestionHandle/Components/AddMockQuestion";
import MockQuestionsTable from "./MockQuestionHandle/Components/MockQuestionsTable";
import UpdateMockQuestion from "./MockQuestionHandle/Components/UpdateMockQuestion";
import MockMasterTable from "./MockMasterHandle/Components/MockMasterTable";

import ClassTable from "./ClassHandle/Components/ClassTable";
import AddClass from "./ClassHandle/Components/AddClass";
import UpdateClass from "./ClassHandle/Components/UpdateClass";

import SetTable from "./SetHandle/Components/SetTable";

export const adminHandle = [
  {
    path: "/AdminTable",
    component: AdminTable,
  },
  {
    path: "/AddAdmin",
    component: AdminRegister,
  },
  {
    path: "/UpdateAdmin/:id",
    component: AdminUpdate,
  },
  {
    path: "/AdminChangePassword",
    component: AdminChangePassword,
  },
];

export const SubjectHandle = [
  {
    path: "/Subject/AddSubject/:id",
    component: AddSubject,
  },
  {
    path: "/SubjectTable/:id",
    component: SubjectTable,
  },
  {
    path: "/Subject/UpdateSubject/:classId/:id",
    component: UpdateSubject,
  },
];

export const TopicHandle = [
  {
    path: "/Topic/AddTopic/:classId/:id",
    component: AddTopic,
  },
  {
    path: "/TopicTable/:classId/:id",
    component: TopicsTable,
  },
  {
    path: "/Topic/UpdateTopic/:classId/:subjectId/:id",
    component: UpdateTopic,
  },
];

export const UserHandle = [
  {
    path: "/AddUser",
    component: UserRegister,
  },
  {
    path: "/UserTable",
    component: UserTable,
  },
  {
    path: "/UpdateCustomer/:id",
    component: UserUpdate,
  },
];

export const QuestionHandle = [
  {
    path: "/QuestionsTable/:classId/:subId/:topicId/:id",
    component: QuestionsTable,
  },
  {
    path: "/Question/AddQuestion/:classId/:subId/:topicId/:id",
    component: AddQuestion,
  },
  {
    path: "/Question/UpdateQuestion/:classId/:subId/:topicId/:setId/:id",
    component: UpdateQuestion,
  },
];

export const MockQuestionHandle = [
  {
    path: "/MockQuestionsTable/:id",
    component: MockQuestionsTable,
  },
  {
    path: "/MockQuestion/AddQuestion/:id",
    component: AddMockQuestion,
  },
  {
    path: "/MockQuestion/UpdateQuestion/:id",
    component: UpdateMockQuestion,
  },
];

export const MockMaster = [
  {
    path: "/MockMasterTable/:classId",
    component: MockMasterTable,
  },
];

export const ClassHandle = [
  {
    path: "/ClassTable",
    component: ClassTable,
  },
  {
    path: "/Class/AddClass",
    component: AddClass,
  },
  {
    path: "/Class/UpdateClass/:id",
    component: UpdateClass,
  },
  {
    path: "/ClassTable/Mock",
    component: ClassTable,
    mode: "mock",
  },
];

export const SetHandle = [
  {
    path: "/SetTable/:classId/:subjectId/:topicId",
    component: SetTable,
  },
];

export const allPath = [
  "Topic",
  "UpdateAdmin",
  "AdminChangePassword",
  "Subject/AddSubject",
  "Subject",
  "SubjectTable",
  "Subject/UpdateSubject/1/12",
  "Topic/AddTopic",
  "TopicTable",
  "Topic/UpdateTopic",
  "AddUser",
  "UserTable",
  "UpdateCustomer",
  "QuestionsTable",
  "SetTable",
  "Class/UpdateClass",
  "Class",
  "Class/AddClass",
  "ClassTable",
  "MockMasterTable",
  "MockQuestion/UpdateQuestion",
  "MockQuestion",
  "MockQuestion/AddQuestion",
  "MockQuestionsTable",
  "Question",
  "Question/UpdateQuestion",
  "Question/AddQuestion/",
  "AddAdmin",
  "AdminTable",
  "dashboard",
  "AddQuestionByExcel",
  "Notification",
  "auth",
  "auth/NewPassword/:token",
  "auth/forget-password",
  "",
];
