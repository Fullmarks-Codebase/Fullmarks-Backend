import React, { useEffect, useRef, useState } from 'react'
import {useHistory} from "react-router-dom"
import { axiosForAdmin } from '../../../../axiosconfig'

function AdminChangePassword() {
    let history = useHistory()
    const [oldPassword, setOldPassword] = useState('')
    const [oldPasswordErr, setOldPasswordErr] = useState('')
    
    const [password, setPassword] = useState('')
    const [passwordErr, setPasswordErr] = useState('')

    const [confirmPassword, setConfirmPassword] = useState('')
    const [confirmPasswordErr, setConfirmPasswordErr] = useState('')
    
    const ignoreFirstRun = useRef(true)

    const [alertMessage, setAlertMessage] = useState({
      variant:'',
      msg:null
    })
    
    const [check, setCheck] = useState(true)

    useEffect(() => {
        if (ignoreFirstRun.current) {
            ignoreFirstRun.current = false
            return;
        }
        if (oldPassword.length < 8) {
            setOldPasswordErr("Required 8 character")
        }
        else { 
            setOldPasswordErr("")
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
        if (passwordErr.length === 0 && oldPasswordErr.length === 0 && confirmPasswordErr.length === 0) {
            setCheck(false)
        }
        else {
            setCheck(true)
        }
    }, [confirmPassword,password,oldPassword,passwordErr,oldPasswordErr,confirmPasswordErr])
    
    const updatePassword = (e) => { 
        e.preventDefault()
        setAlertMessage({ variant: "warning", msg:"Please wait" })
        axiosForAdmin.put("/users/changePassword",{oldPassword, newPassword:password}).then(response=>{
            setAlertMessage({ variant: 'success', msg: "Password Updated SuccessFully" })
            setTimeout(() => {
                history.push("/AdminTable")
            },2000)
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
        <div className="main-content">
            <section className="section">
                <div class="section-header">
                    <h1>Change Password</h1>
                    <div class="section-header-breadcrumb">
                        <div class="breadcrumb-item">
                            <a href="#">Dashboard</a>
                        </div>
                        <div class="breadcrumb-item">
                            Change Password
                        </div>
                    </div>
                </div>
            </section>
            <div className="row justify-content-center">
                <div className="col-sm-6 col-12">
                    <div className="card p-5">
                    {
                        alertMessage.msg && (
                            <div class={`alert alert-${alertMessage.variant}`} role="alert">
                                {alertMessage.msg}
                            </div>
                        )
                    }
                    <div className="wrapper">
                        <form method="POST" onSubmit={e=>updatePassword(e)} >
                        <div className="row">
                            <div className="form-group col-12">
                                <label htmlFor="username">Old Password</label>
                                <input
                                    id="oldpassword"
                                    type="password"
                                    className="form-control"
                                    name="oldpassword"
                                    required
                                    onBlur={(e)=>setOldPassword(e.target.value)}
                                />
                                <div>
                                <sub>{oldPasswordErr?oldPasswordErr:<>&nbsp;</>}</sub>
                                </div>
                            </div>
                            <div className="form-group col-12">
                                <label htmlFor="username">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    required
                                    onBlur={(e)=>setPassword(e.target.value)}
                                />
                                <div>
                                <sub>{passwordErr?passwordErr:<>&nbsp;</>}</sub>
                                </div>
                            </div>
                            <div className="form-group col-12">
                                <label htmlFor="username">Confirm New Password</label>
                                <input
                                    id="cpassword"
                                    type="password"
                                    className="form-control"
                                    name="cpassword"
                                    required
                                    onBlur={(e)=>setConfirmPassword(e.target.value)}
                                />
                                <div>
                                <sub>{confirmPasswordErr?confirmPasswordErr:<>&nbsp;</>}</sub>
                                </div>
                            </div>
                            <div className="form-group col-12">
                                <div className="row justify-content-around">
                                    <button type="submit" class="btn btn-primary col-sm-4 col-12">Update</button>
                                    <button type="button" class="btn btn-secondary col-sm-4 col-12" onClick={()=>history.push("/dashboard")}>Cancel</button>
                                </div>
                            </div>
                        </div>
                        </form>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminChangePassword
