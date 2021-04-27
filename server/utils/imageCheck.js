const valid = ['image/png','image/jpeg','image/jpg','image/svg+xml']
const imageCheck = (myFile) => {
  if(valid.includes(myFile.mimetype)){
    return true  
  }
  else{
    return false
  }
}
module.exports = imageCheck