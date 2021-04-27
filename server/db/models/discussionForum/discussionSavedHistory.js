module.exports = (sequelize, Sequelize) =>{
  const SavedHistory = sequelize.define('discussion_saved_histories', {}, { timestamps:true })
  return SavedHistory;
}