var router = require("express").Router();
const db = require("../../db");
const errorResponse = require("../../utils/errorResponse");
const successResponse = require("../../utils/successResponse");
const Class = db.class
const Subject = db.subjects
const Topic = db.topics
const Set = db.sets
const Question = db.questions

let model = {
  classId:Class, 
  subjectId:Subject, 
  topicId:Topic, 
  setId:Set, 
  questionId:Question
}

router.post("/", async (req,res) => {
  try{
    let check;
    const {classId, subjectId, topicId, setId, questionId} = req.body
    let result = null
    if(classId){
      if(subjectId){
        if(topicId){
          if(setId){
            if(questionId){
              result = await Question.findOne({ where: {
                id:questionId,
                setId,
                topicId,
                subjectId,
                classId
              }})
            }
            result = await Set.findOne({where:{id:setId,topicId,subjectId,classId}})
          }
          result = await Topic.findOne({where:{id:topicId,subjectId,classId}})
        }
        result = await Subject.findOne({where:{id:subjectId,classId}})
      }
      result = await Class.findOne({where:{id:classId}})
    }
    if(result){
      return res.status(200).send(successResponse('Success',200, true))
    }else{
      return res.status(200).send(successResponse('Success',200, false))
    }
  }
  catch(err){
    return res.status(500).send(errorResponse(500,err.toString()))
  }
})

module.exports = router