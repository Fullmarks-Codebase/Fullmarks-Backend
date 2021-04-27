import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosForAdmin } from "../../../axiosconfig";

const validEmailRegex = RegExp(
  //eslint-disable-next-line
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("*Required");
  const ignoreFirstRun = useRef(true);
  const [check, setCheck] = useState(true);
  const [send, setSend] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  useEffect(() => {
    if (ignoreFirstRun.current) {
      ignoreFirstRun.current = false;
      return;
    }
    if (!validEmailRegex.test(email)) {
      setEmailErr("Please enter valid email id...");
    } else {
      setEmailErr("");
    }
    if (emailErr.length === 0) {
      setCheck(false);
    } else {
      setCheck(true);
    }
  }, [email, emailErr]);

  const sendEmail = (e) => {
    e.preventDefault();
    axiosForAdmin
      .post("/forgotPassword", { email: email })
      .then((response) => {
        setAlertMessage({ variant: "success", msg: response.data.message });
        setSend(true);
      })
      .catch((error) => {
        setAlertMessage({
          variant: "danger",
          msg: error.response.data.message,
        });
      });
  };

  return (
    <div id='app'>
      <section class='section'>
        <div class='container mt-5'>
          <div class='row'>
            <div class='col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4'>
              <div class='card card-primary'>
                <form method='POST' onSubmit={(e) => setEmail(e)}>
                  <div class='card-header'>
                    <h4>Forgot Password</h4>
                  </div>
                  {!send ? (
                    <div class='card-body'>
                      {alertMessage.variant === "danger" && alertMessage.msg && (
                        <div
                          class={`alert alert-${alertMessage.variant} ml-3 mr-3`}
                          role='alert'
                        >
                          {alertMessage.msg}
                        </div>
                      )}
                      <p class='text-muted'>
                        We will send a link to reset your password
                      </p>
                      <div class='form-group'>
                        <label for='email'>Email</label>
                        <input
                          id='email'
                          type='email'
                          class='form-control'
                          name='email'
                          tabindex='1'
                          required
                          autofocus
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {
                          <div>
                            <sub>{emailErr ? emailErr : null}</sub>
                          </div>
                        }
                      </div>

                      <div class='form-group'>
                        <button
                          type='submit'
                          class='btn btn-primary btn-lg btn-block'
                          tabIndex='4'
                          disabled={check}
                          onClick={(e) => sendEmail(e)}
                        >
                          Send Email
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        className={`alert alert-${alertMessage.variant} ml-3 mr-3`}
                        role='alert'
                      >
                        {alertMessage.msg}
                      </div>
                      <div className='card ml-3 mr-3'>
                        <Link to='/'>Back to login</Link>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
