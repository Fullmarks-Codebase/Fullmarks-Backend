import React, { useState } from "react"
import { useHistory } from "react-router"
import { axiosForAdmin } from "../../../axiosconfig"


function Notification(){
  let history = useHistory()
  const [data,setData] = useState({
    title:'',
    message:''
  })
  const [err,setErr] = useState({
    title:'',
    message:'',
  })
  
  const [alertMessage, setAlertMessage] = useState({
    variant: '',
    msg:null
  })
  
  const onHandleChange = (event) => {
    const {name,value} = event.target
    setData({...data,[name]:value})
  }

  const sendNotification = (event) =>{

    event.preventDefault()
    if(data.title.trim().length < 4){
      setErr({...err, title:"Need more than 4 character" })
      return 
    }
    if(data.message.trim().length < 10){
      setErr({...err, message:"Need more than 10 character" })
      return 
    }
    setErr({
      title:'',
      message:'',
    })
    setAlertMessage({ variant: "warning", msg:"Please wait" })
    axiosForAdmin.post("/notification",{...data}).then(response=>{
      
      setAlertMessage({ variant: "success", msg: response.data.message })
      setTimeout(()=>{
        history.push("/dashboard")
      },2000)
    }).catch(err=>{
      if(err.response){
        if(err.response.status === 403){
            localStorage.clear("token")
            window.location.replace("/");
        }
      }
      if(err.response.data)
      setAlertMessage({ variant: "danger", msg: err.response.data.message })
    })
  }

  return <>
    <div className="main-content">
    <section className="section">
      <div className="section-header">
        <h1>Send Notification To Users</h1>
      </div>
    </section>
      <div className="row justify-content-center">
        <div className="col-md-6 col-12">
          <div className="card p-md-5 p-5">
            <div className='wrapper'>
              <form method="POST">
                <div className="row justify-content-center">
                  <div className="form-group col-12">
                    {
                      alertMessage.msg && (
                      <div className={`alert alert-${alertMessage.variant}`} role="alert">
                        {alertMessage.msg}
                      </div>
                      )
                    }
                    </div>
                    <div className="form-group col-12">
                      <label htmlFor="name">Title</label>
                      <input
                        id="name"
                        type="text"
                        className="form-control"
                        name="title"
                        required
                        onChange={(e)=>onHandleChange(e)}
                      />
                      <div>
                        <sub>{err.title}</sub>
                      </div>
                    </div>
                    <div className="form-group col-12">
                      <label htmlFor="name">Message</label>
                      <textarea className="form-control" name="message" required onChange={(e) => onHandleChange(e) }></textarea>    
                      <div>
                        <sub>{err.message}</sub>
                      </div>
                    </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary mr-2" onClick={()=>history.goBack()}>Cancel</button>
                  <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#sendNotification" >Send</button>
                </div> 
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="sendNotification" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Send Notification</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="form-group col-12">
                  <label>Title</label>
                  <h5>{data.title}</h5>
                </div>
                <div className="form-group col-12">
                  <label>Message</label>
                  <h6>{data.message}</h6>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">Close</button>
              <button type="button" className="btn btn-warning" data-dismiss="modal" onClick={(e)=>sendNotification(e)}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}
export default Notification