"use strict";

let fix_subjects = [
  {
    name: "Math",
    image: "math.png",
  },
  {
    name: "English",
    image: "english.png",
  },
  {
    name: "Science",
    image: "science.png",
  },
  {
    name: "General Science",
    image: "general-science.png",
  },
  {
    name: "General Knowledge",
    image: "general-knowledge.png",
  },
  {
    name: "Social Studies",
    image: "social-studies.png",
  },
  {
    name: "Chemistry",
    image: "chemistry.png",
  },
  {
    name: "Physics",
    image: "physics.png",
  },
  {
    name: "Biology",
    image: "biology.png",
  },
  {
    name: "EVS",
    image: "evs.png",
  },
  {
    name: "Economics",
    image: "economics.png",
  },
  {
    name: "Business Studies",
    image: "business-studies.png",
  },
  {
    name: "Accountancy",
    image: "accountancy.png",
  },
  {
    name: "Computer",
    image: "computer.png",
  },
  {
    name: "Quantitative Aptitude",
    image: "quantative-aptitude.png",
  },
  {
    name: "Data Interpretation",
    image: "data-interpretation.png",
  },
  {
    name: "Logical Reasoning",
    image: "logical-reasoning.png",
  },
  {
    name: "Verbal Reasoning",
    image: "verbal-reasoning.png",
  },
  {
    name: "General Awareness",
    image: "general-awareness.png",
  },
  {
    name: "Social Science",
    image: "social-studies.png",
  },
];

let classes = [
  {
    name: "Four",
    class_image: "class4.svg",
  },
  {
    name: "Five",
    class_image: "class5.svg",
  },
  {
    name: "Six",
    class_image: "class6.svg",
  },
  {
    name: "Seven",
    class_image: "class7.svg",
  },
  {
    name: "Eight",
    class_image: "class8.svg",
  },
  {
    name: "Nine",
    class_image: "class9.svg",
  },
  {
    name: "Ten",
    class_image: "class10.svg",
  },
  {
    name: "Eleven-Commerce",
    class_image: "class11commerce.svg",
  },
  {
    name: "Eleven-Science",
    class_image: "class11science.svg",
  },
  {
    name: "Twelve-Commerce",
    class_image: "class12commerce.svg",
  },
  {
    name: "Twelve-Science",
    class_image: "class12science.svg",
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    fix_subjects.map((i) => {
      i["createdAt"] = new Date();
      i["updatedAt"] = new Date();
    });
    await queryInterface.bulkInsert("fix_subjects", fix_subjects);

    classes.map((i) => {
      i["createdAt"] = new Date();
      i["updatedAt"] = new Date();
    });
    await queryInterface.bulkInsert("classes", classes);

    await queryInterface.bulkInsert("users", [
      {
        username: "admin",
        email: "admin@admin.com1",
        password:
          "$2b$08$lA6ZbW1/sXx.G.jOHqxVeuGjNBBcXP.wbZ8BTLDzjgwyTKGOEgdSa",
        admin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {},
};
