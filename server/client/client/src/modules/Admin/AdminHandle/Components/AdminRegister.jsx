import React, { useState } from 'react';
import {useHistory, Link} from "react-router-dom";
import {axiosForAdmin} from "../../../../axiosconfig"
const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

export default function AdminRegister(){
  let history = useHistory()
  const [username, setUsername] = useState('')
  const [errUsername,setErrUsername] = useState('')
  const [email,setEmail] = useState('')
  const [errEmail, setErrEmail] = useState('')
  const [password,setPassword] = useState('')
  const [errPassword, setErrPassword] = useState('')
  const [check,setCheck]= useState(true)
  const [cpassword,setCPassword] = useState('')
  const [errCPassword,setErrCPassword] = useState('')
  const [alertMessage,setAlertMessage] = useState({
      variant:'',
      msg:null
  })

  const ignore = React.useRef(true)

  React.useEffect(() => { 
    if (ignore.current) {
      ignore.current = false
      return;
    }
    if(username.length < 5)
      setErrUsername('Full Name must be at least 5 characters long!')
    else
      setErrUsername('');
    if(!validEmailRegex.test(email))
      setErrEmail('Enter valid emailId')
    else
      setErrEmail('');
    if( password.length < 8)
      setErrPassword('password long than 8 letters ')
    else
      setErrPassword('');
    if(password!==cpassword){
        setErrCPassword('password doesnt match')}
    else 
      setErrCPassword('');
    
    if (errUsername.length === 0 && errEmail.length === 0 && errPassword.length === 0 && errCPassword.length === 0) {
      setCheck(false)
    }
    else {
      setCheck(true)
    }
  }, [username, email, password, cpassword, errEmail,errPassword,errUsername,errCPassword])
  

  const createUser = (event) => {
    event.preventDefault();
    setAlertMessage({ variant: "warning", msg:"Please wait" })
    axiosForAdmin.post("/users/add",{ username, email, password,admin:true}).then(response=>{
      setAlertMessage({ variant: 'success', msg: "Admin Created" })
      setTimeout(() => {
        history.push("/AdminTable")
      },100)
    }).catch(error=>{
      if(error.response.data){
        if(error.response.data.code === 403){
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
                    <h1>Create Admin</h1>
                    <div className="section-header-breadcrumb">
                        <div className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                        </div>
                        <div className="breadcrumb-item">
                        <Link to="/AdminTable">Admin</Link>
                        </div>
                        <div className="breadcrumb-item active">Create Admin</div>
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
                          <label htmlFor="username">Username</label>
                          <input
                              id="username"
                              type="text"
                              className="form-control"
                              name="username"
                              required
                              onChange={(e)=>setUsername(e.target.value)}
                          />
                          <div>
                            <sub>{errUsername?errUsername:<>&nbsp;</>}</sub>
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
                          <label htmlFor="password" className="d-block">
                              Password
                          </label>
                          <input
                              id="password"
                              type="password"
                              className="form-control pwstrength"
                              data-indicator="pwindicator"
                              name="password"
                              required
                              onChange={(e)=>setPassword(e.target.value)}
                          />
                          <div>
                            <sub>{errPassword?errPassword:<>&nbsp;</>}</sub>
                          </div>
                        </div>
                        <div className="form-group col-12 col-sm-6">
                          <label htmlFor="cpassword" className="d-block">
                              Password Confirmation
                          </label>
                          <input
                              id="cpassword"
                              type="password"
                              className="form-control"
                              name="cpassword"
                              required
                            onChange={(e)=>setCPassword(e.target.value)}
                          />
                          <div>
                            <sub>{errCPassword?errCPassword:<>&nbsp;</>}</sub>
                          </div>
                        </div>
                      </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={()=>history.push("/AdminTable")}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={check} onClick={(e)=>createUser(e)}>Create</button>
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

