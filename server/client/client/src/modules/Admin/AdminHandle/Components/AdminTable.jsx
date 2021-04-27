import React, { useState, useEffect } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { useHistory } from "react-router-dom";
import { convertDate } from "../../../../utils/helper";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function AdminTable() {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});

  const [refreshTable, setRefreshTable] = useState(true);

  useEffect(() => {
    axiosForAdmin
      .post("/users")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error?.response) {
          if (error?.response?.status === 401) {
            toast.error("You Do not have Access to this module", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        }
        if (error.response)
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        setLoading(false);
      });
  }, [refreshTable]);

  const deleteUser = (e) => {
    e.preventDefault();
    axiosForAdmin
      .delete(`users/deleteAdmin/${selectedUser.id}`)
      .then((response) => {
        setRefreshTable(!refreshTable);
      })
      .catch((error) => {
        if (error.response.data)
          if (error.response.data.code === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
      });
  };

  return (
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Admin</h1>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item active'>
                <Link to='/dashboard'>Dashboard</Link>
              </div>
              <div className='breadcrumb-item'>Admin</div>
            </div>
          </div>
          <div>
            <button
              type='button'
              className='btn btn-primary mb-3 col-12 col-md-2'
              onClick={() => history.push("/AddAdmin")}
            >
              Create User
            </button>
          </div>
          <div className='row'>
            <div className='col-12'>
              <div className='table-responsive'>
                <table className='table table-striped table-hover'>
                  <thead>
                    <tr key='column'>
                      <th scope='col' className='text-center'>
                        Id
                      </th>
                      <th scope='col' className='text-center'>
                        Username
                      </th>
                      <th scope='col' className='text-center'>
                        Email
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
                    ) : users.length < 1 ? (
                      <tr key='none'>
                        <td colSpan='5' align='center'>
                          <b>No Data round...</b>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr key={index + 1} align='center'>
                          <th scope='row'>{index + 1}</th>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{convertDate(user.createdAt)}</td>
                          <td className='w-25'>
                            <button
                              type='button'
                              onClick={() =>
                                history.push(`/UpdateAdmin/${user.id}`)
                              }
                              className='btn btn-primary mr-md-2 mb-2 mr-0'
                            >
                              Update
                            </button>
                            <button
                              type='button'
                              data-toggle='modal'
                              onClick={() => setSelectedUser(user)}
                              data-target='#deleteAdmin'
                              className='btn btn-danger mb-2'
                            >
                              Delete
                            </button>
                          </td>
                          {/* somethin */}
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
        id='deleteAdmin'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <form method='POST' onSubmit={(e) => deleteUser(e)}>
          <div className='modal-dialog' role='document'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title' id='exampleModalLabel'>
                  Delete Admin
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
                    <label htmlFor='first_name'>
                      Are you sure to remove "{selectedUser.username}" as admin?{" "}
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
                  className='btn btn-danger'
                  data-dismiss='modal'
                  onClick={(e) => deleteUser(e)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default AdminTable;
