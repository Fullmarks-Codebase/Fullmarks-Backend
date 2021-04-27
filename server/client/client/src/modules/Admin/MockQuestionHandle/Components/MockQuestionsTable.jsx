import React, {useState,useEffect} from 'react'
import {axiosForAdmin} from "../../../../axiosconfig"
import { useHistory} from "react-router-dom"
import {convertDate } from "../../../../utils/helper"

function MockQuestionsTable(props) {
    let history = useHistory()
    const [ loading, setLoading ] = useState(true)
    const [ questions, setQuestions ] = useState([])
    const [ selectedQuestion, setSelectedQuestion] = useState({})
    const [refreshTable, setRefreshTable] = useState(true)
    const id = props.match.params.id
    useEffect(()=>{
        axiosForAdmin.post("/mockQuestions/byMockId", {mockId:id}).then(response=>{  
            setQuestions(response.data.result)
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
    
    const deleteQuestion = () => {
        axiosForAdmin.delete(`/mockQuestions/${selectedQuestion.id}`).then((response)=>{
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
                    <h1>Mock Questions</h1>
                    <div className="section-header-breadcrumb">
                        <div className="breadcrumb-item active">
                            <a href="#">Dashboard</a>
                        </div>
                        <div className="breadcrumb-item">Mock Questions</div>
                    </div>
                </div>
                <div>
                    <button type="button" className="btn btn-primary mb-3 col-12 col-md-2" onClick={()=>history.push(`/MockQuestion/AddQuestion/${id}`)}>
                        Create Question
                    </button>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col" className="text-center">Id</th>
                                        <th scope="col" className="text-center">Question</th>
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
                                            : questions.length < 1 ? 
                                                <tr>
                                                    <td colSpan="4" align="center"><b>No Data round...</b></td>
                                                </tr>
                                                : questions.map((question,index)=>
                                                    <tr align="center" key={index+1}>
                                                        <th scope="row">{index+1}</th>
                                                        <td id="overflowField" >{question.question}</td>
                                                        <td className="w-25">{convertDate(question.createdAt)}</td>
                                                        <td className="w-25">
                                                            <button type="button" onClick={()=>history.push(`/MockQuestion/UpdateQuestion/${question.id}`)} className="btn btn-primary mr-2">Update</button>
                                                            <button type="button" data-toggle="modal" onClick={()=>setSelectedQuestion(question)} data-target="#deleteSubject" className="btn btn-danger">Delete</button>
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
                            <label htmlFor="first_name">Are you sure to remove question "{selectedQuestion.id}" ? </label>
                            </div>
                        </div>
                        <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={deleteQuestion}>Delete</button>
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}

export default MockQuestionsTable
