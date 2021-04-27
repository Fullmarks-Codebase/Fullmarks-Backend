import React, { useState, useRef, useEffect } from 'react';
import {useHistory, Link} from "react-router-dom";
import {axiosForAdmin} from "../../../../axiosconfig"
import moment from "moment"
import "../assets/User.css"
import Loading from '../../../Loading/Loading';

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

export default function UserUpdate(props){
  let history = useHistory()
  const [loading,setLoading] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errPhoneNumber,setErrPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [errEmail, setErrEmail] = useState('')
  const [userData, setUserData] = useState({
    dob: null,
    gender: null,
    username: null,
    userProfileImage: null,
  })
  const [image, setImage] = useState(null); 
  const [exist, setExist] = useState(false)
  const [fu,forceUpdate] = useState(0)


  const onHandleChange = (event) => {
    const { name, value } = event.target
    if (name === "userProfileImage") {
      setUserData({ ...userData, [name]: event.target.files[0] })    
    }
    else {
      setUserData({ ...userData, [name]: value })    
    }
  }

  const [alertMessage, setAlertMessage] = useState({
      variant:'',
      msg:null
  })
  const ignoreFirstRun = useRef(true)

  const [check,setCheck]= useState(true)
  const [selected, setSelected] = useState("")  
  
  React.useEffect(() => {
    const id = props.match.params.id
    axiosForAdmin.post("/customer/front", { customerId:id }).then(response => {
      const data = response.data.result 
      setEmail(data.email)
      setPhoneNumber(data.phoneNumber)
      setUserData({
        dob:moment(data.dob).format('YYYY-MM-DD'),
        gender: parseInt(data.gender),
        username:data.username,
        userProfileImage: data.userProfileImage
      })
      if(data.userProfileImage){
        setExist(!exist)
      }
      setSelected(data)
    }).then(()=>{
      setLoading(false)
    }).catch(error => {
      if(error.response){
        if(error.response.status === 403){
          localStorage.clear("token")
          window.location.replace("/");
        }
        if(error.response.status === 500){
          window.location.replace("/UserTable");
        }
      }
    })
  }, [fu])

  useEffect(() => {
    if (ignoreFirstRun.current) {
      ignoreFirstRun.current = false
      return;
    }
    if(phoneNumber && phoneNumber.toString().trim().length < 10)
      setErrPhoneNumber('It must be at least 10 number long!')
    else
      setErrPhoneNumber('');
    if(email && !validEmailRegex.test(email))
      setErrEmail('Enter valid emailId')
    else
      setErrEmail('');
    if (errPhoneNumber.length === 0 ) {
      setCheck(false)
    }
    else {
      setCheck(true)
    }
  }, [phoneNumber,email,errPhoneNumber,errEmail])
  
  const updateUser = (e) => {
    e.preventDefault()
    setAlertMessage({ variant: "warning", msg:"Please wait" })
    let formData = new FormData()
    const keys = ["id","phoneNumber","email","dob","gender","username","userProfileImage"]
    const values = [selected.id,phoneNumber,email,userData.dob, userData.gender, userData.username, image]
    for(let i=0;i<keys.length;i++){
      formData.append(keys[i],values[i])
    }
    const config = {
      headers: {
      'content-type': 'multipart/form-data'
      }
    }
    axiosForAdmin.put("/customer/update",formData,config).then(response=>{
      setAlertMessage({ variant: 'success', msg: "User Updated" })
      setTimeout(() => {
          history.push("/UserTable")
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

  const deleteImage = (event) => {
    document.getElementById(event.target.name).value = "";
    setImage(null)
  }

  const handleImage = (event) => {
    setImage(event.target.files[0])
  }

  const deleteOldImage = (event) => {
    event.preventDefault()
    axiosForAdmin.post("/customer/deleteImage", { id: selected.id }).then(res => {
      forceUpdate(n => !n)
    }).catch(err => {
      if(err.response){
        if(err.response.status === 403){
            localStorage.clear("token")
            window.location.replace("/");
        }
      }
    })
  }

  return (
      <>
        {<div className="main-content">
            <section className="section">
                <div className="section-header">
                    <h1>Update Customer / End-Users</h1>
                    <div className="section-header-breadcrumb">
                        <div className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                        </div>
                        <div className="breadcrumb-item">
                        <Link to="/UserTable">User</Link>
                        </div>
                        <div className="breadcrumb-item active">Update Customer/ End-Users</div>
                    </div>
                </div>
                {selected?<div className="card p-sm-5 p-3">
                  <div className="row">
                    <div className="col-12">
                    {
                      alertMessage.msg && (
                        <div className={`alert alert-${alertMessage.variant}`} role="alert">
                            {alertMessage.msg}
                        </div>
                      )
                    }
                    <div className='wrapper'>
                      <form method="POST" onSubmit={e=>updateUser(e)}>
                        <div className="row">
                            <div className="form-group col-12 col-sm-6">
                              <label htmlFor="phoneNumber">Phone Number</label>
                              <input
                                  id="phoneNumber"
                                  type="number"
                                  className="form-control"
                                  name="phoneNumber"
                                  required
                                  defaultValue={selected.phoneNumber}
                                  onChange={(e)=>{setPhoneNumber(e.target.value)}}
                              />
                              <div>
                                <sub>{errPhoneNumber?errPhoneNumber:<>&nbsp;</>}</sub>
                              </div>
                            </div>
                            <div className="form-group col-12 col-sm-6">
                              <label htmlFor="email">Email</label>
                              <input
                                id="email"
                                type="email"
                                className="form-control"
                                name="email"
                                required
                                defaultValue={selected.email}
                                onChange={(e)=>{setEmail(e.target.value)}}
                                />
                              <div>
                                <sub>{errEmail?errEmail:<>&nbsp;</>}</sub>
                              </div>
                            </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-12 col-sm-6">
                          <label>Username</label>
                          <input id="username" name="username" type="text" defaultValue={userData.username} className="form-control" onChange={e=>onHandleChange(e)}/>
                        </div>
                        <div className="form-group col-12 col-sm-6">
                          <label>Gender</label>
                          <select className="form-control" defaultValue={selected.gender} name="gender" id="gender" onChange={e=>onHandleChange(e)}>
                            <option value={null}>select option</option>
                            <option value="0">Male</option>
                            <option value="1">Female</option>
                          </select>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-12 col-sm-6">
                          <label>Date of birth</label>
                          <input id="dob" name="dob" type="date" defaultValue={moment(selected.dob).format("YYYY-MM-DD")} className="form-control" onChange={e=>onHandleChange(e)}/>
                        </div>
                        <div className="form-group col-12 col-sm-6">
                          <label>Profile Image</label>
                          {selected.userProfileImage ? <>
                          <div className="row">
                            <div className="col-md-8 col-12">
                              <img src={`${process.env.REACT_APP_NODE_URL_USER}/${selected.userProfileImage}`} alt='profileImage' width="100%"/>
                            </div>
                            <div className="col-md col-12">
                              <button type="button" className='form-control btn-danger' name="image" onClick={(e) => deleteOldImage(e)}>&#x2717;</button>
                            </div>
                          </div>
                          </> : 
                            <div className="row">
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
                                  <div className="col-md-3 col-12">
                                    <button type="button" className="form-control btn-danger" name="userProfileImage" onClick={(e) => deleteImage(e)}>&#x2717;</button>
                                  </div> : null
                                }  
                            </div>
                            }
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={()=>history.push("/UserTable")}>Cancel</button>
                          <button type="submit" className="btn btn-primary" disabled={check}>Save</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>:<Loading/>}
          </section>
        </div>
      }      
      </>    
    );
  }

