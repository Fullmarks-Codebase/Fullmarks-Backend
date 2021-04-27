import React, { useState } from 'react';
import {Link, useHistory} from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig"
import "../assets/User.css"
import $ from "jquery"
// import "react-datepicker/dist/react-datepicker.css";
// import DatePicker from "react-datepicker";

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

export default function UserRegister(){
  // if ($('#dob')[0].type != 'date' ) $('#dob').datepicker();

  let history = useHistory()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errPhoneNumber,setErrPhoneNumber] = useState('Please enter the phone number')
  const [email,setEmail] = useState('')
  const [errEmail, setErrEmail] = useState('')
  const [check,setCheck]= useState(true)
  const [display, setDisplay] = useState(null)

  const [alertMessage,setAlertMessage] = useState({
      variant:'',
      msg:null
  })

  const [userData, setUserData] = useState({
    dob: null,
    gender: null,
    username: null,
    userProfileImage: null,
  })
  
  const ignore = React.useRef(true)
  
  const deleteImage = (event) => {
    event.preventDefault()
    document.getElementById(event.target.name).value = ""
    setDisplay(null)
  }

  React.useEffect(() => { 
    $('#datepicker').datepicker({
      uiLibrary: 'bootstrap4'
    });
    if (ignore.current) {
      ignore.current = false
      return;
    }
    if(phoneNumber.length !== 10)
      setErrPhoneNumber('It must be 10 characters long!')
    else
      setErrPhoneNumber('');
    if(email.length < 2 && !validEmailRegex.test(email))
      setErrEmail('Enter valid emailId')
    else
      setErrEmail('');
    if (errPhoneNumber.length === 0 && errEmail.length === 0) {
      setCheck(false)
    }
    else {
      setCheck(true)
    }
  }, [phoneNumber, email, errEmail,errPhoneNumber])
  
  const onHandleChange = (event) => {
    const { name, value } = event.target
    if (name === "userProfileImage") {
      let reader = new FileReader()
      reader.readAsDataURL(event.target.files[0])
  
      reader.onloadend = () => {
        setDisplay(reader.result)
      }
      setUserData({ ...userData, [name]: event.target.files[0] })    
    }
    else {
      setUserData({ ...userData, [name]: value })    
    }
  }
  const [startDate, setStartDate] = useState(new Date());
  const createUser = (event) => {
    event.preventDefault();
    setAlertMessage({ variant: "warning", msg:"Please wait" })
    var formData = new FormData();
    formData.append('phoneNumber', phoneNumber)
    formData.append('email', email)
    formData.append('admin',false)
    for ( var key in userData ) {
        formData.append(key, userData[key]);
    }
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    axiosForAdmin.post("/customer/add",formData,config).then(response=>{
      setAlertMessage({ variant: 'success', msg: "Customer/ End-Users Created" })
      setTimeout(() => {
        history.push("/UserTable")
      },1500)
      }).catch(error=>{
        setAlertMessage({variant:'danger', msg:error.response.data.message})
        if(error.response){
          if(error.response.status === 403){
              localStorage.clear("token")
              window.location.replace("/");
          }
        }
      })
    }
    return (
      <>
        <div className="main-content">
          <section className="section">
            <div className="section-header">
              <h1>Create Customer / End-Users</h1>
              <div className="section-header-breadcrumb">
                <div className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </div>
                <div className="breadcrumb-item">
                  <Link to="/UserTable">User</Link>
                </div>
                <div className="breadcrumb-item active">Create</div>
              </div>
            </div>
            <div className="card p-sm-5 p-3">
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
                <form method="POST" onSubmit={e=>createUser(e)}>
                  <div className="row">
                    <div className="form-group col-12 col-sm-6">
                      <label htmlFor="phoneNumber">Phone Number *</label>
                      <input
                          id="phoneNumber"
                          type="number"
                          className="form-control"
                          name="phoneNumber"
                          required
                          onChange={(e)=>setPhoneNumber(e.target.value)}
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
                        onChange={(e)=>setEmail(e.target.value)}
                      />
                      <div>
                        <sub>{errEmail?errEmail:<>&nbsp;</>}</sub>
                      </div>
                    </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-12 col-sm-6">
                        <label>Username</label>
                        <input id="username" name="username" type="text" required className="form-control" onChange={e=>onHandleChange(e)}/>
                      </div>
                      <div className="form-group col-12 col-sm-6">
                        <label>Gender</label>
                        <select className="form-control" name="gender" required id="gender" onChange={e=>onHandleChange(e)}>
                          <option disabled selected value="">select option</option>
                          <option value="0">Male</option>
                          <option value="1">Female</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-12 col-sm-6">
                      <label>Profile Image</label>
                        <div className="row">       
                          <div className="col-md col-12">
                            <input id="userProfileImage" name="userProfileImage" type="file" className="form-control" onChange={e=>onHandleChange(e)}/>
                          </div>
                          {display ?
                            <div className="col-md-3 col-12">
                              <button type="button" className="btn btn-danger w-100 w-md mt-2 mt-md-0" name="userProfileImage" onClick={(e) => deleteImage(e)}>&#x2717;</button>
                            </div> : null
                          } 
                        </div>
                      </div>
                      <div className="form-group col-12 col-sm-6">
                        <label>Date of birth</label>
                        <div >
                          <input id="dob" name="dob" type="date"className="form-control" onChange={e=>onHandleChange(e)}/>
                          {/* <DatePicker style={{width:"100%"}} selected={userData.dob} placeholderText="mm/dd/yyyy" className="form-control" name="dob" onChange={date => setUserData({...userData, dob:date})} /> */}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={()=>history.push("/UserTable")}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={check}>Create</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            </div>
          </section>
        </div>
      </>
    );
  }

