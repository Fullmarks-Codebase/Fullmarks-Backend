import React, { useEffect, useRef, useState } from 'react'
import {useHistory} from "react-router-dom"
import { axiosForAdmin } from "../../../axiosconfig";

function NewPassword(props) {
  const [password, setPassword] = useState('')
  const [passwordErr, setPasswordErr] = useState('')
  
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordErr, setConfirmPasswordErr] = useState('')
  
  const [alertMessage, setAlertMessage] = useState({
    variant:'',
    msg:null
  })
  const ignoreFirstRun = useRef(true)
  const [check, setCheck] = useState(true)

  let history = useHistory()
    useEffect(() => {
      const token = props.match.params.token;
      axiosForAdmin.post("/checkResetPasswordToken", { token: token }).catch(err => {
        setAlertMessage({
          variant: 'danger',
          msg:err.response.data.message
        })
        setTimeout(()=>{history.push("/")},1500)
      })
    }, [])

    useEffect(() => {
      if (ignoreFirstRun.current) {
          ignoreFirstRun.current = false
          return;
      }
      if (password.length < 8) {
          setPasswordErr('Required 8 character')
      }
      else {
          setPasswordErr('')
      }
      if (confirmPassword !== password) {
          setConfirmPasswordErr("Password does not match")
      }
      else{ 
          setConfirmPasswordErr('')
      }
      if (passwordErr.length === 0 && confirmPasswordErr.length === 0) {
          setCheck(false)
      }
      else {
          setCheck(true)
      }
  }, [confirmPassword,password,passwordErr,confirmPasswordErr])

  const updateNewPassword = (e) => {
    e.preventDefault()
    axiosForAdmin.post("/updateNewPassword", { resetToken: props.match.params.token, newPassword: password }).then((response) => {
      setAlertMessage({
        variant: 'success',
        msg:response.data.message
      })
      setTimeout(() => {
        history.push("/")
      },1500)
    }).catch(error => {
      setAlertMessage({
        variant: 'danger',
        msg:error.response.data.message
      })
    })
  }

  return (
      <div id="app">
      <section className="section">
        <div className="container mt-5">
          <div className="row">
            <div className="col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4">
              <div className="card card-primary">
                <form method="POST" onSubmit={e=>updateNewPassword(e)}>
                <div className="card-header">
                  <h4>Reset Password</h4>
                  </div>
                    {
                      alertMessage.msg && (
                      <div class={`alert alert-${alertMessage.variant} ml-3 mr-3`} role="alert">
                        {alertMessage.msg}
                      </div>
                      )
                    }
                  <div className="card-body">
                    <div className="form-group">
                        <label htmlFor="email">New Password</label>
                        <input
                        id="password"
                        type="password"
                        className="form-control"
                        name="password"
                        required
                        autoFocus
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                        <div>
                          <sub>{passwordErr?passwordErr:<>&nbsp;</>}</sub>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Confirm Password</label>
                        <input
                        id="cpassword"
                        type="password"
                        className="form-control"
                        name="cpassword"
                        required
                        autoFocus
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                        />
                        <div>
                          <sub>{confirmPasswordErr?confirmPasswordErr:<>&nbsp;</>}</sub>
                        </div>  
                    </div>
                    <div className="form-group">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg btn-block"
                          tabIndex="4"
                          disabled={check}
                          // onClick={e=>updateNewPassword(e)}
                        >
                          Change
                        </button>
                    </div>
                    <div className="form-group">
                        <button
                        type="button"
                        className="btn btn-secondary btn-lg btn-block"
                        onClick={() => window.location.replace("/")}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewPassword
