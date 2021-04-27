import React, { useState, useRef, useEffect } from 'react';
import {  useHistory} from "react-router-dom";
import {axiosForAdmin} from "../../../../axiosconfig"
import Loading from '../../../Loading/Loading';


export default function UpdateSubject(props){
  let history = useHistory()
  const [name, setName] = useState('')
  const [errName,setErrName] = useState('')
  const [detail,setDetail] = useState('')
  const [errDetail, setErrDetail] = useState('')
  const [image, setImage] = useState(null); 
  const [exist, setExist] = useState(false)
  const [fu,forceUpdate] = useState(0)
  const id = props.match.params.id
  const classId = props.match.params.classId
  const [alertMessage, setAlertMessage] = useState({
      variant:'',
      msg:null
  })
  const ignoreFirstRun = useRef(true)

  const [check,setCheck]= useState(true)
  const [selected, setSelected] = useState("")  
  
  React.useEffect(() => {
    axiosForAdmin.post("/subjects/onlySubjects", { subjectId: id, classId }).then(response => {
      setName(response.data.result.name)
      setDetail(response.data.result.detail || '')
      setSelected(response.data.result)
      if (response.data.result.image) {
        setExist(!exist)
      }
    }).catch(err => {
      if(err.response){
        if(err.response.status === 403){
            localStorage.clear("token")
            window.location.replace("/");
        }
      }
      if(err.response.status===404){
        setAlertMessage({variant:"danger", msg:err.response.data.message})
        setTimeout(()=>{
          history.push("/dashboard")
        },1500)
      }
      setAlertMessage({variant:"danger", msg:err.response.data.message})
    })
  }, [fu])

  useEffect(() => {
      if (ignoreFirstRun.current) {
          ignoreFirstRun.current = false
          return;
      }
      if( name.trim().length < 1)
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
  
  const deleteImage = (event) => {
    document.getElementById(event.target.name).value = "";
    setImage(null)
  }

  const handleImage = (event) => {
    setImage(event.target.files[0])
  }

  const updateSubject = (e) => {
      e.preventDefault()
      setAlertMessage({ variant: "warning", msg:"Please wait" })
      let formData = new FormData()
      formData.append('id',selected.id)
      formData.append('name', name)
      formData.append('detail', detail)
      formData.append('image', image)
        const config = {
          headers: {
          'content-type': 'multipart/form-data'
          }
      }
      axiosForAdmin.put("/subjects/updateSubject",formData,config).then(response=>{
          setAlertMessage({ variant: 'success', msg: "Subject Updated" })
          setTimeout(() => {
            history.push("/SubjectTable/"+classId)
          },1500)
      }).catch(error=>{
          setAlertMessage({variant:'danger', msg:error.response.data.message})
      })
  }

  const deleteOldImage = (event) => {
    event.preventDefault()
    const { name } = event.target
    axiosForAdmin.post("/subjects/deleteImage", { id, image_field: name }).then(res => {
      forceUpdate(n => !n)
    }).catch(err => {
        console.log(err)
    })
  }
  return (
    <>
      <div className="main-content">
          <section className="section">
              <div className="section-header">
                  <h1>Update Subject</h1>
              </div>
              <div className="row justify-content-center">
                <div className="col-md-6">  
                  {selected?<div className="card p-5 p-md-3">
                    <div className='wrapper'>
                      <form method="POST" onSubmit={e=>updateSubject(e)}>
                      <div className="row justify-content-center">
                          <div className="form-group col-10 mt-4">
                          {
                            alertMessage.msg && (
                              <div className={`alert alert-${alertMessage.variant}`} role="alert">
                                {alertMessage.msg}
                              </div>
                            )
                          }
                          </div>
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
                            <label htmlFor="textarea">Subject Detail</label>
                            <textarea className="form-control" defaultValue={ selected.detail} onChange={(e)=>{setDetail(e.target.value)}}></textarea>    
                          </div>
                        <div className="form-group col-10">
                          <div className="row">
                          {selected.image ? <>
                            <div className="col-md-8 col-12">
                              {/* <img src={`${process.env.REACT_APP_NODE_URL}/public/subjects/${selected.image}`} alt={selected.image} width="100%"/> */}
                              <img src={`${process.env.REACT_APP_NODE_URL_SUBJECTS}/${selected.image}`} alt={selected.image} width="100%"/>
                            </div>
                            <div className="col-md col-12">
                              <button type="button" className='form-control btn-danger' name="image" onClick={(e) => deleteOldImage(e)}>&#x2717;</button>
                            </div>
                          </> : 
                            <>
                              <div className="col-md col-12">    
                                <input
                                  id="image"
                                  type="file"
                                  className="form-control"
                                  name="image"
                                  onChange={(e)=>handleImage(e)}
                                />
                              </div>
                                {image ?
                                  <div className="col-md-2 col-12">
                                    <button type="button" className="form-control btn-danger" name="image" onClick={(e) => deleteImage(e)}>&#x2717;</button>
                                  </div> : null
                                }  
                            </>
                            }
                          </div>
                        </div>           
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary mr-4" onClick={()=>history.goBack()}>Cancel</button>
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

