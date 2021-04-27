import React, { useEffect, useState } from "react"
import { useHistory } from "react-router"
import { axiosForAdmin } from "../../../axiosconfig"
import Loading from "../../Loading/Loading"

function AddQuestionByExcel(){
  let history = useHistory()
  const [alertMessage, setAlertMessage] = useState({
    variant: '',
    msg:null
  })
  const [loading,setLoading] = useState(false)
  const [click, setClick]= useState('default')

  const addQuestions = (e) => {
    e.preventDefault()
    setLoading(true)

    var imagefile = document.querySelector('#questions') 
    var questions_image = document.querySelector('#question_image')
    var answers_image = document.querySelector('#answers_image')

    setAlertMessage({ variant: "warning", msg:"Please wait" })
    
    let formData = new FormData()
    
    formData.append('questions', imagefile.files.length > 0 ? imagefile.files[0] : null)
    formData.append('question_image',questions_image.files.length > 0 ? questions_image.files[0] : null)
    formData.append('answers_image',answers_image.files.length > 0 ? answers_image.files[0] : null)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    axiosForAdmin.post(`/addQuestion${click==="mock"?"/mock":''}`, formData, config).then(res => {
      setLoading(false)
      setAlertMessage({ variant: "success", msg: res.data.message })
      setTimeout(()=>{
        history.push("/dashboard")
      },2000)
    }).catch(err => {
      setLoading(false)
      if(err.response)
        if(err.response.status)
          if(err.response.status===404){
            setAlertMessage({variant:"danger", msg:err.response.data.message})
          }
      if(err.response){
        if(err.response.status)
          if(err.response.status === 403){
              localStorage.clear("token")
              window.location.replace("/");
          }
      }
      console.log(err.response)
      setAlertMessage({variant:"danger", msg:err.response})
    })  
  }
    
  const resetInput = (mode) =>{
    setClick(mode)
    document.getElementById('questions').value = ""
    document.getElementById('question_image').value = ""
    document.getElementById('answers_image').value = ""
  }

  return <>
   {!loading?
   <>
      <div className="main-content">
        <section className="section">
          <div className="section-header">
            <h1>Upload Questions</h1>
          </div>
        </section>  
      </div>  
      <div className="row justify-content-center">
        <div className="col-md-6 col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <div onClick={()=> resetInput('default') } className={`font-weight-bold nav-link ${click==="default"?'active':null}`}>
                Fix Subject Question
              </div>
            </li>
            <li className="nav-item">
              <div onClick={()=>resetInput('mock')} className={`font-weight-bold nav-link ${click==="mock"?'active':null}`}>
                Mock Question
              </div>
            </li>
          </ul>
          <div className="card p-md-5 p-5"> 
            <div className='wrapper'> 
              <form method="POST" onSubmit={e=>addQuestions(e)}>
                <div className="row justify-content-center">
                <div className="form-group col-11">
                {
                  alertMessage.msg && (
                  <div className={`alert alert-${alertMessage.variant}`} role="alert">
                    {alertMessage.msg}
                  </div>
                  )
                }
                </div>
                <div className="form-group col-11">
                  <label>{click==="default"?"Question Excel file:":"Mock Question Excel file:"}</label>
                  <input type="file" id="questions" name="questions" className="form-control col-12" />
                </div>
                <div className="form-group col-11">
                  <label>Upload Questions Image Zip File:</label>
                  <input type="file" id="question_image" className="form-control col-12" />
                </div>
                <div className="form-group col-11">
                  <label>Upload Answer Image Zip File:</label>
                  <input type="file" id="answers_image" className="form-control col-12" />
                </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary mr-2" onClick={()=>history.push("/dashboard")}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div> 
              </form>
            </div>
          </div>
        </div>
      </div>
      </>
    : <Loading />}
    </>
}

export default AddQuestionByExcel