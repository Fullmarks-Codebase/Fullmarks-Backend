import React, { useState, useEffect } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { Link, useHistory } from "react-router-dom";
import { convertDate } from "../../../../utils/helper";
import $ from "jquery";

function SetTable(props) {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState({});
  const [refreshTable, setRefreshTable] = useState(true);
  const [name, setName] = useState("");
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  const [newSetName, setNewSetName] = useState(null);
  const classId = props.match.params.classId;
  const subjectId = props.match.params.subjectId;
  const topicId = props.match.params.topicId;
  // eslint-disable-next-line
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    $("input").val("");
    setAlertMessage({
      variant: "",
      msg: null,
    });
    axiosForAdmin
      .post("/subjects/topics/sets", { topicId, subjectId, classId })
      .then((response) => {
        setSets(response.data.result);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error.response);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [refreshTable]);

  const newSet = () => {
    const last = sets.slice(-1)[0];
    if (last) {
      setNewSetName("Set " + parseInt(parseInt(last.name.split(" ")[1]) + 1));
    } else {
      setNewSetName("Set " + 1);
    }
  };

  const createSet = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });
    axiosForAdmin
      .post(`/subjects/topics/sets/add`, {
        name: newSetName,
        classId,
        topicId,
        subjectId,
      })
      .then((response) => {
        setAlertMessage({ variant: "success", msg: response.data.message });
        setTimeout(() => {
          setUpdated(false);
          $("input").val("");
          $("#create").modal("toggle");
          setAlertMessage({
            variant: "",
            msg: null,
          });
          setRefreshTable(!refreshTable);
        }, 1500);
      })
      .catch((error) => {
        if (error.response.data) {
          setAlertMessage({
            variant: "danger",
            msg: error.response.data.message,
          });
          setTimeout(() => {
            setAlertMessage({
              variant: "",
              msg: null,
            });
          }, 2000);
        }
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
      });
  };

  const updateSet = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });
    axiosForAdmin
      .put(`/subjects/topics/sets/update`, { name: name, id: selectedSet.id })
      .then((response) => {
        console.log(response);
        setAlertMessage({ variant: "success", msg: response.data.message });
        setUpdated(true);
        setTimeout(() => {
          setUpdated(false);
          $("input").val("");
          $("#update").modal("toggle");
          setRefreshTable(!refreshTable);
        }, 1500);
      })
      .catch((error) => {
        if (error.response.data) {
          setAlertMessage({
            variant: "danger",
            msg: error.response.data.message,
          });
          setTimeout(() => {
            setAlertMessage({
              variant: "",
              msg: null,
            });
          }, 2000);
        }
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
      });
  };

  const deleteSet = (e) => {
    e.preventDefault();
    axiosForAdmin
      .delete(`/subjects/topics/sets/${selectedSet.id}`)
      .then((response) => {
        setRefreshTable(!refreshTable);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
      });
  };

  return (
    <div>
      <div className='main-content fix'>
        <section className='section'>
          <div className='section-header'>
            <h1>Sets</h1>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item active'>
                <Link to='/dashboard'>Dashboard</Link>
              </div>
              <div className='breadcrumb-item active'>
                <Link to='/ClassTable'>Class</Link>
              </div>
              <div className='breadcrumb-item active'>
                <Link to={`/SubjectTable/${classId}`}>Subject</Link>
              </div>
              <div className='breadcrumb-item active'>
                <Link to={`/TopicTable/${classId}/${subjectId}`}>Topic</Link>
              </div>

              <div className='breadcrumb-item'>Sets</div>
            </div>
          </div>
          <div>
            <button
              type='button'
              data-target='#create'
              data-toggle='modal'
              className='btn btn-primary mb-3 col-12 col-md-2'
              onClick={newSet}
            >
              Create Set
            </button>
          </div>
          <div className='row'>
            <div className='col-12'>
              <div className='table-responsive'>
                <table className='table table-striped table-hover'>
                  <thead>
                    <tr>
                      <th scope='col' className='text-center'>
                        Id
                      </th>
                      <th scope='col' className='text-center'>
                        Name
                      </th>
                      <th scope='col' className='text-center'>
                        CreatedAt
                      </th>
                      <th scope='col' className='text-center'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr key='none'>
                        <td colSpan='4' align='center'>
                          <b>
                            <div
                              className='spinner-border text-secondary'
                              role='status'
                            >
                              <span className='sr-only'>Loading...</span>
                            </div>
                          </b>
                        </td>
                      </tr>
                    ) : sets.length < 1 ? (
                      <tr>
                        <td colSpan='4' align='center'>
                          <b>No Data round...</b>
                        </td>
                      </tr>
                    ) : (
                      sets.map((sets, index) => (
                        <tr align='center' key={index}>
                          <th scope='row'>{index + 1}</th>
                          <td>{sets.name}</td>
                          <td>{convertDate(sets.createdAt)}</td>
                          <td>
                            {/* <button type="button" data-toggle="modal" onClick={() => {setSelectedSet(sets); setName(sets.name)}} data-target="#update" className="btn btn-primary mr-2 mb-2 mb-md-1">Update</button> */}
                            <button
                              type='button'
                              onClick={() =>
                                history.push(
                                  `/QuestionsTable/${classId}/${subjectId}/${topicId}/${sets.id}`
                                )
                              }
                              className='btn btn-warning mr-2 mb-2 mb-md-1'
                            >
                              Manage Questions
                            </button>
                            <button
                              type='button'
                              data-toggle='modal'
                              onClick={() => setSelectedSet(sets)}
                              data-target='#delete'
                              className='btn btn-danger mb-2'
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div
        className='modal fade'
        id='delete'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='delete'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='delete'>
                Delete Set
              </h5>
              <button
                type='button'
                className='close'
                data-dismiss='modal'
                aria-label='Close'
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
            <div className='modal-body'>
              <div className='row'>
                <div className='form-group col-12'>
                  <label>
                    <h5>
                      Deleting set will delete its all questions respestively.
                      Are you sure to remove sets "{selectedSet.name}" ?{" "}
                    </h5>
                  </label>
                </div>
              </div>
              <button
                type='button'
                className='btn btn-secondary mr-2'
                data-dismiss='modal'
              >
                Close
              </button>
              <button
                type='button'
                className='btn btn-danger'
                onClick={(e) => deleteSet(e)}
                data-dismiss='modal'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className='modal show'
        id='create'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='create'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='create'>
                Create Set
              </h5>
            </div>
            <div className='modal-body'>
              <form onSubmit={(e) => createSet(e)}>
                <div className='row'>
                  {alertMessage.msg ? (
                    <div className='form-group col-12'>
                      <div
                        className={`alert alert-${alertMessage.variant}`}
                        role='alert'
                      >
                        {alertMessage.msg}
                      </div>
                    </div>
                  ) : null}
                  <div className='form-group col-12'>
                    <label htmlFor='name'>
                      {" "}
                      Do you want to Create New Set: "{newSetName}"?{" "}
                    </label>
                  </div>
                </div>
                <button
                  type='button'
                  className='btn btn-secondary mr-2'
                  data-dismiss='modal'
                >
                  Close
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                  onClick={(e) => createSet(e)}
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        className='modal show'
        id='update'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='update'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='update'>
                Update Set
              </h5>
            </div>
            <div className='modal-body'>
              <form onSubmit={(e) => updateSet(e)}>
                <div className='row'>
                  <div className='form-group col-12'>
                    {alertMessage.msg ? (
                      <div
                        className={`alert alert-${alertMessage.variant}`}
                        role='alert'
                      >
                        {alertMessage.msg}
                      </div>
                    ) : null}
                  </div>
                  <div className='form-group col-12'>
                    <label htmlFor='name'> Update Set </label>
                    <input
                      type='text'
                      className='form-control'
                      name='name'
                      required
                      defaultValue={selectedSet.name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type='button'
                  className='btn btn-secondary mr-2'
                  data-dismiss='modal'
                >
                  Close
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                  onClick={(e) => updateSet(e)}
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetTable;
