'use strict';

let fix_subjects = [
  {
    name:"Math",
    image:"math.svg"
  },
  {
    name:"English",
    image:"english.svg"
  },
  {
    name:"Science",
    image:"science.svg"
  },
  {
    name:"General Science",
    image:"general-science.svg"
  },
  {
    name:"General Knowledge",
    image:"general-knowledge.svg"
  },
  {
    name:"Social Studies",
    image:"social-studies.svg"
  },
  {
    name:"Chemistry",
    image:"chemistry.svg"
  },
  {
    name:"Physics",
    image:"physics.svg"
  },
  {
    name:"Biology",
    image:"biology.svg"
  },
  {
    name:"EVS",
    image:"evs.svg"
  },
  {
    name:"Economics",
    image:"economics.svg"
  },
  {
    name:"Business Studies",
    image:"business-studies.svg"
  },
  {
    name:"Accountancy",
    image:"accountancy.svg"
  },
  {
    name:"Computer",
    image:"computer.svg"
  },
  {
    name:"Quantitative Aptitude",
    image:"quantative-aptitude.svg"
  },
  {
    name:"Data Interpretation",
    image:"data-interpretation.svg"
  },
  {
    name:"Logical Reasoning",
    image:"logical-reasoning.svg"
  },
  {
    name:"Verbal Reasoning",
    image:"verbal-reasoning.svg"
  },
  {
    name:"General Awareness",
    image:"general-awareness.svg"
  },

]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('fix_subjects', fix_subjects);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
