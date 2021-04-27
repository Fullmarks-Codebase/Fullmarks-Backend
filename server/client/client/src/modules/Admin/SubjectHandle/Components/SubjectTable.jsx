import React, {useState,useEffect} from 'react'
import {axiosForAdmin} from "../../../../axiosconfig"
import {Link, useHistory} from "react-router-dom"
import {convertDate } from "../../../../utils/helper"
import "./Subject.css"

function SubjectTable(props) {
    let history = useHistory()
    const [fixSubject, setFixSubject] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ subjects, setSubject ] = useState([])
    const [ selectedSub, setSelectedSub] = useState({})
    const [refreshTable,setRefreshTable] = useState(true)
    const [alertMessage, setAlertMessage] = useState({
        variant: '',
        msg:null
    })
    //classId
    const id = props.match.params.id

    useEffect(()=>{
        setAlertMessage({
            variant: '',
            msg:null
        })
        axiosForAdmin.get("subjects/fixSubject").then(response=>{
            
            setFixSubject(response.data.result)
        }).catch(error=>{
            if(error.response){
                if(error.response.status === 403){
                    localStorage.clear("token")
                    window.location.replace("/");
                }
            }
            
        })
        axiosForAdmin.post("subjects/onlySubjects",{id:id}).then(response=>{  
            setSubject(response.data.result)
            setLoading(false)
        }).catch(error => {
            if(error.response){
                if(error.response.status === 403){
                    localStorage.clear("token")
                    window.location.replace("/");
                }
              }
            setLoading(false)
        })
    }, [refreshTable])
    
    const addSubject = (e,subject) => {
        e.preventDefault();
        axiosForAdmin.post(`subjects/addSubject`,{name:subject.name, file_name:subject.image, classId:id }).then((response)=>{
            setRefreshTable(!refreshTable)
        }).catch(error=>{
            if(error.response){
                if(error.response.status === 403){
                    localStorage.clear("token")
                    window.location.replace("/");
                }
              }
          setAlertMessage({variant:"danger", msg:error.response.data.message})
          setTimeout(() => {
            setAlertMessage({
                variant: '',
                msg:null
            })
          }, 2000);
        })
    }

    const deleteSubject = () =>{
        axiosForAdmin.delete(`subjects/${selectedSub.id}`).then((response)=>{
            setRefreshTable(!refreshTable)
        }).catch(error=>{
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
            <div className="main-content fix">
                <section className="section">
                    <div className="section-header">
                        <h1>Subjects</h1>
                        <div className="section-header-breadcrumb">
                            <div className="breadcrumb-item active">
                                <Link to="/dashboard">Dashboard</Link>
                            </div>
                            <div className="breadcrumb-item active">
                                <Link to={`/ClassTable`}>Class</Link>
                            </div>
                            <div className="breadcrumb-item">Subjects</div>
                        </div>
                       
                    </div>
                    <div className="row">
                        <div className="dropdown col-md-6 col-12">
                            <button className="btn btn-primary dropdown-toggle mb-3 custom" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Add Subject
                            </button>
                            <div className="dropdown-menu" id="customArea" aria-labelledby="dropdownMenuButton">
                                {fixSubject.map((subject,index)=>{
                                    return <li className="dropdown-item" key={index} onClick={(e)=> addSubject(e,subject)} >{subject.name}</li>
                                })}
                            </div>
                        </div>
                        <div className="col-md-6 col-12">
                        {
                            alertMessage.msg && (
                                <div className={`alert alert-${alertMessage.variant}`} role="alert">
                                    {alertMessage.msg}
                                </div>
                            )
                        }
                        </div>
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
                                                : subjects.length < 1 ? 
                                                    <tr>
                                                        <td colSpan="4" align="center"><b>No Data round...</b></td>
                                                    </tr>
                                                    : subjects.map((subject,index)=>
                                                        <tr align="center" key={index}>
                                                            <th scope="row">{index+1}</th>
                                                            <td>{subject.name}</td>
                                                            <td>{convertDate(subject.createdAt)}</td>
                                                            <td>
                                                                <button type="button" onClick={()=>history.push(`/Subject/UpdateSubject/${id}/${subject.id}`)} className="btn btn-primary mr-2">Update</button>
                                                                <button type="button" onClick={()=>{history.push(`/TopicTable/${id}/${subject.id}`)}} className="btn btn-warning mr-2">Manage Topic</button>
                                                                <button type="button" data-toggle="modal" onClick={()=>setSelectedSub(subject)} data-target="#deleteSubject" className="btn btn-danger">Delete</button>
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
            <div className="modal fade" id="deleteSubject" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Delete Subject</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="form-group col-12">
                                <label><h5>Deleting subject will delete its all topics, sets, and questions respestively. Are you sure to remove subject "{selectedSub.name}" ?</h5> </label>
                                </div>
                            </div>
                            <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={deleteSubject}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SubjectTable
