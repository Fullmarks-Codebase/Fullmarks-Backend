import React, { useState, useEffect } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { useHistory, Link } from "react-router-dom";
import { convertDate } from "../../../../utils/helper";

function ClassTable(props) {
  let history = useHistory();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  // eslint-disable-next-line
  const [selectedClass, setSelectedClass] = useState({});
  const [refreshTable, setRefreshTable] = useState(true);

  useEffect(() => {
    axiosForAdmin
      .post("class")
      .then((response) => {
        setClasses(response.data.result);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response)
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        setLoading(false);
      });
  }, [refreshTable]);

  const deleteClass = () => {
    axiosForAdmin
      .delete(`class/${selectedClass.id}`)
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
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Classes</h1>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item active'>
                <Link to='/dashboard'>Dashboard</Link>
              </div>
              <div className='breadcrumb-item'>Class</div>
            </div>
          </div>
          <div>
            {/* <button type="button" className="btn btn-primary mb-3 col-12 col-md-2" onClick={()=>history.push(`/Class/AddClass`)}>
                        Create Class
                    </button> */}
          </div>
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
                    <td colSpan='5' align='center'>
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
                ) : classes.length < 1 ? (
                  <tr>
                    <td colSpan='4' align='center'>
                      <b>No Data round...</b>
                    </td>
                  </tr>
                ) : (
                  classes.map((classes, index) => (
                    <tr key={index + 1} align='center'>
                      <th scope='row'>{index + 1}</th>
                      <td>{classes.name}</td>
                      <td>{convertDate(classes.createdAt)}</td>
                      <td className=''>
                        {/* <button type="button" onClick={()=>history.push(`/Class/UpdateClass/${classes.id}`)} className="btn btn-primary mr-2">Update</button> */}
                        {props.mode === "mock" ? (
                          <button
                            type='button'
                            onClick={() => {
                              history.push(`/MockMasterTable/${classes.id}`);
                            }}
                            className='btn btn-warning mr-2'
                          >
                            Mock Master
                          </button>
                        ) : (
                          <button
                            type='button'
                            onClick={() => {
                              history.push(`/SubjectTable/${classes.id}`);
                            }}
                            className='btn btn-warning mr-2'
                          >
                            Subject
                          </button>
                        )}
                        {/* <button type="button" data-toggle="modal" onClick={() => setSelectedClass(classes)} data-target="#deleteClass" className="btn btn-danger">Delete</button> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div
        className='modal fade'
        id='deleteClass'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='exampleModalLabel'>
                Delete Class
              </h5>
            </div>
            <div className='modal-body'>
              <div className='row'>
                <div className='form-group col-12'>
                  <label>
                    <h5>
                      Deleting class will delete its all subjects, topics, sets,
                      and questions respestively. Are you sure to remove Class "
                      {selectedClass.name}"?
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
                data-dismiss='modal'
                onClick={deleteClass}
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

export default React.memo(ClassTable);
