import React, { useState, useRef, useEffect } from 'react';
import {  useHistory} from "react-router-dom";
import {axiosForAdmin} from "../../../../axiosconfig"
import Loading from '../../../Loading/Loading';


export default function UpdateTopic(props){
  let history = useHistory()
  const [name, setName] = useState('')
  const [errName,setErrName] = useState('')
  const [detail,setDetail] = useState('')
  const [errDetail, setErrDetail] = useState('')
  const classId = props.match.params.classId
  const subjectId = props.match.params.subjectId
  const [alertMessage, setAlertMessage] = useState({
      variant:'',
      msg:null
  })
    
  const ignoreFirstRun = useRef(true)

  const [check,setCheck]= useState(true)
  const [selected, setSelected] = useState("")  
  
  React.useEffect(() => {
    const id = props.match.params.id
      axiosForAdmin.get(`/subjects/getSingleTopic/${id}`, { id: id }).then(response => {
        setName(response.data.name)
        setDetail(response.data.detail || '')
        setSelected(response.data)
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
  }, [])

  useEffect(() => {
      if (ignoreFirstRun.current) {
        ignoreFirstRun.current = false
        return;
      }
      if(name.trim().length < 1)
        setErrName('Required')
      else
        setErrName('');
      if (detail.trim().length < 1) {
        setErrDetail('Required')
      }
      else {
        setErrDetail('')
      }
      if (errName.length === 0 && errDetail.length === 0) {
        setCheck(false)
      }
      else { 
        setCheck(true)
      }
    }, [errName,name,detail,errDetail])
  
  const updateTopic = (e) => {
    e.preventDefault()
    setAlertMessage({ variant: "warning", msg:"Please wait" })
    let formData = new FormData()
    formData.append('id',selected.id)
    formData.append('name', name)
    formData.append('detail', detail)
    formData.append('classId', classId)
    formData.append('subjectId', subjectId)
    const config = {
      headers: {
      'content-type': 'multipart/form-data'
      }
    }
    axiosForAdmin.put("/subjects/topic/updateTopic",formData,config).then(response=>{
      setAlertMessage({ variant: 'success', msg: "Topic Updated" })
      setTimeout(() => {
        history.push(`/TopicTable/${classId}/${subjectId}`)
      },1000)
    }).catch(error=>{
      if(error.response){
        if(error.response.status === 403){
            localStorage.clear("token")
            window.location.replace("/");
        }
      }
      setAlertMessage({variant:'danger', msg:error.response.data.message})
    })
  }

    return (
      <>
        <div className="main-content">
            <section className="section">
              <div className="section-header">
                <h1>Update Topic</h1>
              </div>
              <div className="row justify-content-center">
                <div className="col-md-6 col-12">
                  {selected?<div className="card">
                    <div className='wrapper mt-5'>
                      <form method='POST' onSubmit={(e)=>updateTopic(e)}>
                        <div className="row justify-content-center">
                          <div className="form-group col-10">
                          {
                            alertMessage.msg && (
                              <div className={`alert alert-${alertMessage.variant}`} role="alert">
                                {alertMessage.msg}
                              </div>
                            )
                          }
                          </div>
                        </div>
                        <div className="row justify-content-center">
                          <div className="form-group col-10">
                            <label htmlFor="name">Name</label>
                            <input
                              id="name"
                              type="text"
                              className="form-control"
                              name="name"
                              required
                              defaultValue={selected.name}
                              onChange={(e)=>{setName(e.target.value)}}
                            />
                            <div>
                              <sub>{errName?errName:<>&nbsp;</>}</sub>
                              </div>
                          </div>
                          <div className="form-group col-10">
                            <label htmlFor="textarea">Topic Detail</label>
                            <textarea className="form-control" defaultValue={selected.detail} onChange={(e)=>{setDetail(e.target.value)}}></textarea>    
                          </div>           
                        </div>
                        <div className="modal-footer mb-2">
                          <button type="button" className="btn btn-secondary mr-2" onClick={()=>history.push(`/TopicTable/${classId}/${subjectId}`)}>Cancel</button>
                          <button type="submit" className="btn btn-primary" disabled={check}>Save</button>
                        </div> 
                      </form>
                    </div>
                  </div>:<Loading/>}
                </div>
              </div>
            </section>
          </div>
      </>
    );
  }

