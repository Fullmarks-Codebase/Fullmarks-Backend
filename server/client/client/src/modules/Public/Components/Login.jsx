import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);
  const loginAdmin = async (e) => {
    e.preventDefault();
    axios
      .post(
        `${process.env.REACT_APP_NODE_URL}/users/login`,
        { email, password },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.code === 400) {
          setAlertMessage({
            variant: "danger",
            msg: "Wrong email or Password",
          });
        } else {
          localStorage.setItem("token", response.data.user.token);
          setAlertMessage({ variant: "success", msg: "Successfully Login" });
          setTimeout(() => {
            window.location.replace("/dashboard");
          }, 1000);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div id='app'>
        <section className='section'>
          <div className='container mt-5'>
            <div className='row'>
              <div className='col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4'>
                <div className='card card-primary'>
                  <div className='card-header'>
                    <h4>Login</h4>
                  </div>

                  <div className='card-body'>
                    <form
                      method='POST'
                      onSubmit={(e) => {
                        loginAdmin(e);
                      }}
                    >
                      {alertMessage.msg && (
                        <div
                          className={`alert alert-${alertMessage.variant}`}
                          role='alert'
                        >
                          {alertMessage.msg}
                        </div>
                      )}
                      <div className='form-group'>
                        <label htmlFor='email'>Email</label>
                        <input
                          id='email'
                          type='email'
                          className='form-control'
                          name='email'
                          tabIndex='1'
                          required
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className='invalid-feedback'>
                          Please fill in your email
                        </div>
                      </div>

                      <div className='form-group'>
                        <div className='d-block'>
                          <label htmlFor='password' className='control-label'>
                            Password
                          </label>
                          <div className='float-right'>
                            <Link
                              className='text-small'
                              to='/auth/forget-password'
                            >
                              Forgot Password?
                            </Link>
                          </div>
                        </div>
                        <input
                          id='password'
                          type='password'
                          className='form-control'
                          name='password'
                          tabIndex='2'
                          required
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className='invalid-feedback'>
                          please fill in your password
                        </div>
                      </div>
                      <div className='form-group'>
                        <button
                          type='submit'
                          className='btn btn-primary btn-lg btn-block'
                          tabIndex='4'
                        >
                          Login
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Login;
