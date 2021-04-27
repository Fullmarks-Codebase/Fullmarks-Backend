import React, { useState, useEffect } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { useHistory, Link } from "react-router-dom";
import { convertDate } from "../../../../utils/helper";
import "./topics.css";

function TopicTable(props) {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState({});
  const [subId, setSubId] = useState(0);
  const [refreshTable, setRefreshTable] = useState(true);
  const classId = props.match.params.classId;
  //subjectId
  const id = props.match.params.id;

  useEffect(() => {
    setSubId(id);
    axiosForAdmin
      .post("subjects/onlyTopics", { subjectId: id })
      .then((response) => {
        setTopics(response.data.result);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [refreshTable]);

  const deleteTopic = () => {
    axiosForAdmin
      .delete(`subjects/topic/${selectedTopic.id}`)
      .then((response) => {
        setRefreshTable(!refreshTable);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
      });
  };

  return (
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Topics</h1>
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
              <div className='breadcrumb-item'>Topic</div>
            </div>
          </div>
          <div>
            <button
              type='button'
              className='btn btn-primary mb-3 col-12 col-md-2'
              onClick={() =>
                history.push(`/Topic/AddTopic/${classId}/${subId}`)
              }
            >
              Create Topic
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
                    ) : topics.length < 1 ? (
                      <tr>
                        <td colSpan='4' align='center'>
                          <b>No Data round...</b>
                        </td>
                      </tr>
                    ) : (
                      topics.map((topic, index) => (
                        <tr key={index + 1} align='center'>
                          <th scope='row'>{index + 1}</th>
                          <td>{topic.name}</td>
                          <td>{convertDate(topic.createdAt)}</td>
                          <td>
                            <button
                              type='button'
                              onClick={() =>
                                history.push(
                                  `/Topic/UpdateTopic/${classId}/${id}/${topic.id}`
                                )
                              }
                              className='btn btn-primary mr-2'
                            >
                              Update
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                history.push(
                                  `/SetTable/${classId}/${subId}/${topic.id}`
                                )
                              }
                              className='btn btn-warning mr-2'
                            >
                              Manage Sets
                            </button>
                            <button
                              type='button'
                              data-toggle='modal'
                              onClick={() => setSelectedTopic(topic)}
                              data-target='#deleteTopic'
                              className='btn btn-danger'
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
        id='deleteTopic'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='exampleModalLabel'>
                Delete Topic
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
                      Deleting topic will delete its sets, and questions
                      respestively. Are you sure to remove Topic "
                      {selectedTopic.name}" ?{" "}
                    </h5>{" "}
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
                data-dismiss='modal'
                onClick={deleteTopic}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TopicTable;
