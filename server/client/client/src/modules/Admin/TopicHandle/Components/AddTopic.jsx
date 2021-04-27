import React, { useState, useEffect, useRef } from 'react'
import { axiosForAdmin } from '../../../../axiosconfig';
import { useHistory } from "react-router-dom"

function AddTopic(props) {
  let history = useHistory()
  const id = props.match.params.id
  const classId = props.match.params.classId
  const [name, setName] = useState('');
  const [nameErr,setNameErr] = useState('')
  const [detail, setDetail] = useState('');
  const [detailErr,setDetailErr] = useState('')
  const [alertMessage, setAlertMessage] = useState({
    variant: '',
    msg:null
  })
  const [valid,setValid] = useState(true)
  const ignore = useRef(true)
  const addTopic = (e) => {
    e.preventDefault()
    setAlertMessage({ variant: "warning", msg:"Please wait" })
    let formData = new FormData()
    formData.append('name', name)
    formData.append('subjectId',id)
    formData.append('classId',classId)
    formData.append('detail', detail)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    axiosForAdmin.post("/subjects/topic/addTopic",formData,config).then(res => {
      setAlertMessage({ variant: "success", msg: res.data.message })
      setTimeout(() => {
        history.push(`/TopicTable/${classId}/${id}`)
      },1000)
    }).catch(err => {
      if(err.response.status===404){
        setAlertMessage({variant:"danger", msg:err.response.data.message})
        setTimeout(()=>{
          history.push("/dashboard")
        },1500)
      }
      if(err.response){
        if(err.response.status === 403){
            localStorage.clear("token")
            window.location.replace("/");
        }
      }
      setAlertMessage({variant:"danger", msg:err.response.data.message})
    })
  }
  
  useEffect(() => {
    if (ignore.current) {
      ignore.current=false
      return;
    }
    if (name.trim().length < 1) {
      setNameErr("Required")
    } else {
      setNameErr('')
    }
    if (detail.trim().length < 1) {
      setDetailErr("Required")
    } else {
      setDetailErr('')
    }
    if (nameErr.length < 1 && detailErr.length < 1) {
      setValid(false)
    }
    else {
      setValid(true)
    }
  },[name,detail,nameErr,detailErr])

  return (
    <div className="main-content">
      <section className="section">
        <div class="section-header">
         <h1>Add Topic</h1>
        </div>
      </section>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className='wrapper mt-4'>
              <form method="POST" onSubmit={(e)=>addTopic(e)}>
                <div className="row justify-content-center">
                  <div className="form-group col-10">
                  {
                    alertMessage.msg && (
                      <div class={`alert alert-${alertMessage.variant} mt-3`} role="alert">
                        {alertMessage.msg}
                      </div>
                    )
                  }
                  </div>    
                  <div className="form-group col-10">
                    <label htmlFor="username">Topic Name</label>
                    <input
                      id="topicName"
                      type="text"
                      className="form-control"
                      name="topicName"
                      required
                      onChange={(e)=>setName(e.target.value)}
                    />
                    <div>
                      <sub>{nameErr?nameErr:<>&nbsp;</>}</sub>
                    </div>
                  </div>
                </div>
                <div className="row justify-content-center">
                  <div className="form-group col-10">
                    <label htmlFor="textarea">Topic Detail</label>
                    <textarea class="form-control" onChange={(e) => setDetail(e.target.value)}></textarea>
                    <div>
                      <sub>{detailErr?detailErr:<>&nbsp;</>}</sub>
                    </div>
                  </div>
                </div>
                <div className="modal-footer mb-2">
                  <button type="button" class="btn btn-secondary mr-2" onClick={()=>history.push(`/TopicTable/${classId}/${id}`)}>Cancel</button>
                  <button type="submit" class="btn btn-primary" disabled={valid}>Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default AddTopic
