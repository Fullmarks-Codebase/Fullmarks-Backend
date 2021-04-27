import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory, Link } from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig";
import globalContext from "../../../../context/globalContext";

const validEmailRegex = RegExp(
  //eslint-disable-next-line
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

export default function AdminUpdate(props) {
  let history = useHistory();
  const [username, setUsername] = useState("");
  const [errUsername, setErrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordErr, setConfirmPasswordErr] = useState("");
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  const [userAccessModules, setUserAccessModules] = useState([]);
  const ignoreFirstRun = useRef(true);

  const [check, setCheck] = useState(true);
  const [selected, setSelected] = useState("");

  const { allUserAccessModules } = useContext(globalContext);

  React.useEffect(() => {
    const id = props.match.params.id;

    axiosForAdmin
      .post("/users", { userId: id })
      .then((response) => {
        setEmail(response.data[0].email);
        setUsername(response.data[0].username);
        setSelected(response.data[0]);
        if (response.data[0].userAccessModules)
          setUserAccessModules(JSON.parse(response.data[0].userAccessModules));
      })
      .catch((err) => {
        if (err) return console.log(err);
        if (err?.response) {
          if (err?.response?.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          setAlertMessage({ variant: "danger", msg: "User Not Found" });
          setTimeout(() => {
            history.push("/AdminTable");
          }, 1500);
        }
        if (err?.response?.data)
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
      });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (ignoreFirstRun.current) {
      ignoreFirstRun.current = false;
      return;
    }
    if (username.length < 5)
      setErrUsername("Full Name must be at least 5 characters long!");
    else setErrUsername("");
    if (password.length < 8) {
      setPasswordErr("Required 8 character");
    } else {
      setPasswordErr("");
    }
    if (confirmPassword !== password) {
      setConfirmPasswordErr("Password does not match");
    } else {
      setConfirmPasswordErr("");
    }
    if (!validEmailRegex.test(email)) setErrEmail("Enter valid emailId");
    else setErrEmail("");
    if (
      errUsername.length === 0 &&
      errEmail.length === 0 &&
      password.length === 0
    ) {
      setCheck(false);
    } else {
      if (password.length > 7 && passwordErr.length === 0) {
        setCheck(false);
      } else {
        setCheck(true);
      }
    }
    // eslint-disable-next-line
  }, [
    confirmPassword,
    password,
    passwordErr,
    confirmPasswordErr,
    username,
    email,
    errUsername,
    errEmail,
  ]);

  const updateUser = (e) => {
    e.preventDefault();
    if (userAccessModules.length <= 0)
      return setAlertMessage({
        variant: "danger",
        msg: "User Access modules cannot be empty",
      });

    setAlertMessage({ variant: "warning", msg: "Please wait" });
    axiosForAdmin
      .put("/users/update", {
        id: selected.id,
        username,
        email,
        password,
        userAccessModules,
      })
      .then((response) => {
        setAlertMessage({ variant: "success", msg: "Admin Updated" });
        setTimeout(() => {
          history.push("/AdminTable");
        }, 1000);
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
            <h1>Update Admin</h1>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item'>
                <Link to='/dashboard'>Dashboard</Link>
              </div>
              <div className='breadcrumb-item'>
                <Link to='/AdminTable'>Admin</Link>
              </div>
              <div className='breadcrumb-item active'>Update Admin</div>
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
                  <form method='POST' onSubmit={(e) => updateUser(e)}>
                    <div className='row'>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='username'>Username</label>
                        <input
                          id='username'
                          type='text'
                          className='form-control'
                          name='username'
                          required
                          defaultValue={selected.username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                          }}
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
                          defaultValue={selected.email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                        />
                        <div>
                          <sub>{errEmail ? errEmail : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='email'>Password</label>
                        <input
                          id='password'
                          type='password'
                          className='form-control'
                          name='password'
                          onChange={(e) => {
                            setPassword(e.target.value);
                          }}
                        />
                        <div>
                          <sub>{passwordErr ? passwordErr : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                      <div className='form-group col-12 col-sm-6'>
                        <label htmlFor='email'>Confirm Password</label>
                        <input
                          id='cpassword'
                          type='password'
                          className='form-control'
                          name='cpassword'
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                          }}
                        />
                        <div>
                          <sub>
                            {confirmPasswordErr ? (
                              confirmPasswordErr
                            ) : (
                              <>&nbsp;</>
                            )}
                          </sub>
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
                            userAccessModules.length > 0 &&
                            userAccessModules.map((id) => {
                              return (
                                <div
                                  key={id}
                                  className='badge badge-pill badge-light mr-1 ml-1 pr-3 pl-3 mb-3'
                                >
                                  {allUserAccessModules[id]?.displayName}
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
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Access Modules section wrapper ends */}
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
