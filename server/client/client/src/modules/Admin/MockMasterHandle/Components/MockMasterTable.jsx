import React, {useState,useEffect} from 'react'
import {axiosForAdmin} from "../../../../axiosconfig"
import {Link, useHistory} from "react-router-dom"
import {convertDate } from "../../../../utils/helper"
import $ from "jquery"
import TimeField from 'react-simple-timefield';
import moment from "moment"

function MockMasterTable(props) {
    let history = useHistory()
    const [ loading, setLoading ] = useState(true)
    const [ mock, setMock ] = useState([])
    const [ selectedSub, setSelectedSub] = useState({})
    const [refreshTable, setRefreshTable] = useState(true)
    const [name,setName] = useState('')
    const [alertMessage, setAlertMessage] = useState({
        variant: '',
        msg:null
    })
    const [time,setTime] = useState('00:00:00')
    const classId = props.match.params.classId
    useEffect(()=>{
        $('input').val('');
        axiosForAdmin.post("mock",{classId}).then(response=>{  
            setName('')
            setMock(response.data.result)
            setLoading(false)
        }).catch(error => {
            console.log(error.response)
            setLoading(false)
        })
    }, [refreshTable])


    const createMock = (e) => {
        e.preventDefault();
        setAlertMessage({ variant: "warning", msg:"Please wait" })
        axiosForAdmin.post(`mock/add`,{name:name, classId:classId, time:moment.duration(time).asSeconds()}).then((response)=>{
            setAlertMessage({ variant: "success", msg: response.data.message })
            setTimeout(()=>{
                $('input').val('');
                $('#create').modal('toggle');
                setAlertMessage({
                    variant: '',
                    msg:null
                })
                setRefreshTable(!refreshTable)  
            },1500)  
        }).catch(error=>{
            if(error.response){
                if(error.response.status === 403){
                    localStorage.clear("token")
                    window.location.replace("/");
                }
              }
            if(error.response.data){
                setAlertMessage({ variant: "danger", msg: error.response.data.message })
            }
        })
    }

    const updateMock = (e) => {
        e.preventDefault()
        setAlertMessage({ variant: "warning", msg:"Please wait" })
        axiosForAdmin.put(`mock/update`,{ name:name, id:selectedSub.id, time:moment.duration(time).asSeconds()}).then((response)=>{
            setAlertMessage({ variant: "success", msg: response.data.message })
            setTimeout(()=>{
                $('input').val('');
                $('#update').modal('toggle');
                setAlertMessage({
                    variant: '',
                    msg:null
                })
                setRefreshTable(!refreshTable)  
            },1500)  
        }).catch(error=>{
            if(error.response.data){
                setAlertMessage({ variant: "danger", msg: error.response.data.message })
                setTimeout(()=>{
                    setAlertMessage({
                        variant: '',
                        msg:null
                    })
                },2000)
            }
        })
    }

    const deleteMock = (e) => {
        e.preventDefault()
        axiosForAdmin.delete(`mock/${selectedSub.id}`).then((response)=>{
            setRefreshTable(!refreshTable)
        }).catch(error=>{
            console.log(error.response)
        })
    }

    return (
        <div>
            <div className="main-content fix">
            <section className="section">
                <div className="section-header">
                    <h1>Mock Test</h1>
                    <div className="section-header-breadcrumb">
                        <div className="breadcrumb-item active">
                            <Link to="/dashboard">Dashboard</Link>
                        </div>
                        <div className="breadcrumb-item">Mock Test</div>
                    </div>
                </div>
                <div>
                    <button type="button" data-target="#create" data-toggle="modal" className="btn btn-primary mb-3 col-12 col-md-2" >
                        Create Mock
                    </button>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col" className="text-center">Id</th>
                                        <th scope="col" className="text-center">Name</th>
                                        <th scope="col" className="text-center">CreatedAt</th>
                                        <th scope="col" className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        loading ?
                                            <tr key="none">
                                                <td colSpan="4" align="center">
                                                    <b>
                                                        <div className="spinner-border text-secondary" role="status">
                                                            <span className="sr-only">Loading...</span>
                                                        </div>
                                                    </b>
                                                </td>
                                            </tr>
                                            : mock.length < 1 ? 
                                                <tr>
                                                    <td colSpan="4" align="center"><b>No Data round...</b></td>
                                                </tr>
                                                : mock.map((mock,index)=>
                                                    <tr align="center" key={index}>
                                                        <th scope="row">{index+1}</th>
                                                        <td>{mock.name}</td>
                                                        <td>{convertDate(mock.createdAt)}</td>
                                                        <td>
                                                            <button type="button" data-toggle="modal" onClick={() => { setSelectedSub(mock);setName(mock.name)}} data-target="#update" className="btn btn-primary mr-2 mb-2 mb-md-0">Update</button>
                                                            <button type="button" onClick={()=>history.push(`/MockQuestionsTable/${mock.id}`)} className="btn btn-warning mr-2 mb-2 mb-md-0">Questions</button>
                                                            <button type="button" data-toggle="modal" onClick={()=>setSelectedSub(mock)} data-target="#delete" className="btn btn-danger mb-2 mb-md-0">Delete</button>
                                                        </td>
                                                    </tr>
                                                )   
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
            </div>
            <div className="modal fade" id="delete" tabIndex="-1" role="dialog" aria-labelledby="delete" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="delete">Delete Subject</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="form-group col-12">
                                <label htmlFor="">Are you sure to remove mock "{selectedSub.name}" ? </label>
                                </div>
                            </div>
                            <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-danger" onClick={(e)=>deleteMock(e)} data-dismiss="modal">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal show" id="create" tabIndex="-1" role="dialog" aria-labelledby="create" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="create">Create Mock</h5>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={e=>createMock(e)}>
                                <div className="row">
                                        {
                                            alertMessage.msg && (
                                                <div className="form-group col-12">
                                                    <div className={`alert alert-${alertMessage.variant}`} role="alert">
                                                        {alertMessage.msg}
                                                    </div>
                                                </div>  
                                            )
                                        }
                                    <div className="form-group col-12">
                                        <label htmlFor="name">  Mock Name </label>
                                        <input type="text" id="name" className="form-control" name="name" required onChange={e=>setName(e.target.value)} />
                                    </div>
                                    <div className="form-group col-12">
                                        <label htmlFor="name"> Time </label>
                                        <TimeField
                                            value={time}                       // {String}   required, format '00:00' or '00:00:00'
                                            onChange={(event, value) => setTime(event.target.value)} // {Function} required
                                            input={ <input type="text" id="name" className="form-control" name="name"/>}   // {Element}  default: <input type="text" />
                                            colon=":"                          // {String}   default: ":"
                                            showSeconds                        // {Boolean}  default: false
                                        />
                                    </div>
                                </div>
                                <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary" onClick={e=>createMock(e)}>Create</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal show" id="update" tabIndex="-1" role="dialog" aria-labelledby="update" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="update">Update Mock</h5>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={e=>updateMock(e)}>
                                <div className="row">
                                        {
                                            alertMessage.msg && (
                                                <div className="form-group col-12">
                                                    <div className={`alert alert-${alertMessage.variant}`} role="alert">
                                                        {alertMessage.msg}
                                                    </div>
                                                </div>
                                            )
                                        }
                                    <div className="form-group col-12">
                                        <label htmlFor="name"> Mock Name </label>
                                        <input type="text" id="name" className="form-control" name="name" required value={selectedSub.name} onChange={e=>setName(e.target.value)} />
                                    </div>
                                    <div className="form-group col-12">
                                        <label htmlFor="name"> Time </label>
                                        <TimeField
                                            value={moment("1900-01-01 00:00:00").add(selectedSub.time, 'seconds').format("HH:mm:ss")}                       // {String}   required, format '00:00' or '00:00:00'
                                            onChange={(event, value) => setTime(event.target.value)} // {Function} required
                                            input={ <input type="text" id="name" className="form-control" name="name"/>}   // {Element}  default: <input type="text" />
                                            colon=":"                          // {String}   default: ":"
                                            showSeconds                        // {Boolean}  default: false
                                        />
                                    </div>
                                </div>
                                <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary" onClick={e=>updateMock(e)}>Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MockMasterTable
