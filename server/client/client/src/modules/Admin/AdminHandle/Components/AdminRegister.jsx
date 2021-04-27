import React, { useContext, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig";
import globalContext from "../../../../context/globalContext";
const validEmailRegex = RegExp(
  //eslint-disable-next-line
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

export default function AdminRegister() {
  let history = useHistory();
  const [username, setUsername] = useState("");
  const [errUsername, setErrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [check, setCheck] = useState(true);
  const [cpassword, setCPassword] = useState("");
  const [errCPassword, setErrCPassword] = useState("");
  const [userAccessModules, setUserAccessModules] = useState([]);
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });

  const ignore = React.useRef(true);

  const { allUserAccessModules } = useContext(globalContext);

  React.useEffect(() => {
    if (ignore.current) {
      ignore.current = false;
      return;
    }
    if (username.length < 5)
      setErrUsername("Full Name must be at least 5 characters long!");
    else setErrUsername("");
    if (!validEmailRegex.test(email)) setErrEmail("Enter valid emailId");
    else setErrEmail("");
    if (password.length < 8) setErrPassword("password long than 8 letters ");
    else setErrPassword("");
    if (password !== cpassword) {
      setErrCPassword("password doesnt match");
    } else setErrCPassword("");

    if (
      errUsername.length === 0 &&
      errEmail.length === 0 &&
      errPassword.length === 0 &&
      errCPassword.length === 0 &&
      userAccessModules.length !== 0
    ) {
      setCheck(false);
    } else {
      setCheck(true);
    }
  }, [
    username,
    email,
    password,
    cpassword,
    errEmail,
    errPassword,
    errUsername,
    errCPassword,
    userAccessModules,
  ]);

  const createUser = (event) => {
    event.preventDefault();
    if (userAccessModules.length <= 0)
      return setAlertMessage({
        variant: "danger",
        msg: "User Access modules cannot be empty",
      });

    setAlertMessage({ variant: "warning", msg: "Please wait" });
    axiosForAdmin
      .post("/users/add", {
        username,
        email,
        password,
        admin: true,
        userAccessModules,
      })
      .then((response) => {
        setAlertMessage({ variant: "success", msg: "Admin Created" });
        setTimeout(() => {
          history.push("/AdminTable");
        }, 100);
      })
      .catch((error) => {
        if (error.response.data) {
          if (error.response.data.code === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        setAlertMessage({
          variant: "danger",
          msg: error.response.data.message,
        });
      });
  };
  return (
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Create Admin</h1>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item'>
                <Link to='/dashboard'>Dashboard</Link>
              </div>
              <div className='breadcrumb-item'>
                <Link to='/AdminTable'>Admin</Link>
              </div>
              <div className='breadcrumb-item active'>Create Admin</div>
            </div>
          </div>
          <div className='card p-sm-5 p-3'>
            <div className='row'>
              <div className='col-12'>
                {alertMessage.msg && (
                  <div
                    className={`alert alert-${alertMessage.variant}`}
                    role='alert'
                  >
                    {alertMessage.msg}
                  </div>
                )}
                <div className='wrapper'>
                  <form method='POST' onSubmit={(e) => createUser(e)}>
                    <div className='row'>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='username'>Username</label>
                        <input
                          id='username'
                          type='text'
                          className='form-control'
                          name='username'
                          required
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <div>
                          <sub>{errUsername ? errUsername : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='email'>Email</label>
                        <input
                          id='email'
                          type='email'
                          className='form-control'
                          name='email'
                          required
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <div>
                          <sub>{errEmail ? errEmail : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                    </div>
                    <div className='row'>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='password' className='d-block'>
                          Password
                        </label>
                        <input
                          id='password'
                          type='password'
                          className='form-control pwstrength'
                          data-indicator='pwindicator'
                          name='password'
                          required
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div>
                          <sub>{errPassword ? errPassword : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='cpassword' className='d-block'>
                          Password Confirmation
                        </label>
                        <input
                          id='cpassword'
                          type='password'
                          className='form-control'
                          name='cpassword'
                          required
                          onChange={(e) => setCPassword(e.target.value)}
                        />
                        <div>
                          <sub>{errCPassword ? errCPassword : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                    </div>
                    {/* Access Modules section Wrapper*/}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Access Modules section */}
                      <div style={{ display: "flex", maxWidth: "45rem" }}>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <select
                            required
                            onChange={(e) => {
                              e.persist();
                              if (e.target.value !== "-1")
                                setUserAccessModules((oldVal) => [
                                  ...Array.from(
                                    new Set([
                                      ...oldVal,
                                      parseInt(e.target.value),
                                    ])
                                  ),
                                ]);
                            }}
                            className='form-select'
                            style={{ maxHeight: "50px", padding: "5px" }}
                            aria-label='Default select example'
                          >
                            <option value={-1}>Select Modules</option>
                            {Object.entries(allUserAccessModules).map(
                              ([key, value]) => {
                                if (!userAccessModules.includes(value.id)) {
                                  return (
                                    <option
                                      key={key}
                                      value={value.id}
                                      className='p-1'
                                    >
                                      {value?.displayName}
                                    </option>
                                  );
                                } else return null;
                              }
                            )}
                          </select>
                          <button
                            onClick={() =>
                              setUserAccessModules(
                                Object.entries(allUserAccessModules).map(
                                  ([key, value]) => value?.id
                                )
                              )
                            }
                            type='button'
                            className='btn btn-info btn-sm mt-4'
                          >
                            Select All
                          </button>
                          <button
                            onClick={() => setUserAccessModules([])}
                            type='button'
                            className='btn btn-danger btn-sm mt-4'
                          >
                            Reset
                          </button>
                        </div>
                        {/* Pills */}
                        <div>
                          {allUserAccessModules &&
                            Object.keys(allUserAccessModules).length > 0 &&
                            userAccessModules.length > 0 &&
                            userAccessModules.map((id) => {
                              return (
                                <div
                                  key={id}
                                  className='badge badge-pill badge-light mr-1 ml-1 pr-3 pl-3 mb-3'
                                >
                                  {allUserAccessModules[id].displayName}
                                  <span
                                    className='btn btn-danger pt-0 pb-0 ml-2 pr-2 pl-2 rounded-circle'
                                    aria-hidden='true'
                                    onClick={() =>
                                      setUserAccessModules((modules) =>
                                        modules.filter((item) => item !== id)
                                      )
                                    }
                                  >
                                    &times;
                                  </span>
                                </div>
                              );
                            })}

                          {/*  */}
                        </div>
                      </div>
                      {/* Access Modules section wrapper ends */}
                      <div className='modal-footer'>
                        <button
                          type='button'
                          className='btn btn-secondary'
                          onClick={() => history.push("/AdminTable")}
                        >
                          Cancel
                        </button>
                        <button
                          type='submit'
                          className='btn btn-primary'
                          disabled={check}
                          onClick={(e) => createUser(e)}
                        >
                          Create
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
    </>
  );
}
