import React, { useEffect, useState } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { useHistory } from "react-router-dom";

function AddSubject(props) {
  const classId = props.match.params.id;
  let history = useHistory();
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  const [errName, setErrName] = useState("");
  const [errDetail, setErrDetail] = useState("");
  const [check, setCheck] = useState(true);
  const [display, setDisplay] = useState(null);

  const handleImage = (event) => {
    let reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onloadend = () => {
      setDisplay(reader.result);
    };
  };

  const deleteImage = (event) => {
    event.preventDefault();
    document.getElementById(event.target.name).value = "";
    setDisplay(null);
  };

  const ignoreFirstRun = React.useRef(true);
  useEffect(() => {
    if (ignoreFirstRun.current) {
      ignoreFirstRun.current = false;
      return;
    }
    if (name.trim().length < 1) setErrName("Required");
    else setErrName("");
    if (detail.length < 8) {
      setErrDetail("Required");
    } else {
      setErrDetail("");
    }
    if (errName.length === 0 && errDetail.length === 0) {
      setCheck(false);
    } else {
      setCheck(true);
    }
  }, [errName, name, detail, errDetail]);

  const addSubject = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });
    let formData = new FormData();
    var imagefile = document.querySelector("#image");
    formData.append("classId", classId);
    formData.append("name", name);
    formData.append("detail", detail);
    formData.append("image", imagefile.files[0]);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axiosForAdmin
      .post("/subjects/addSubject", formData, config)
      .then((res) => {
        setAlertMessage({ variant: "success", msg: res.data.message });
        setTimeout(() => {
          history.goBack();
        }, 1500);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
          setTimeout(() => {
            history.push("/dashboard");
          }, 1500);
        }
        if (err.response) {
          if (err.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        setAlertMessage({ variant: "danger", msg: err.response.data.message });
      });
  };

  return (
    <div className='main-content'>
      <section className='section'>
        <div className='section-header'>
          <h1>Subject</h1>
        </div>
      </section>
      <div className='row justify-content-center'>
        <div className='col-md-6 col-12'>
          <div className='card'>
            <div className='wrapper mt-md-5 mt-2'>
              <form method='POST' onSubmit={(e) => addSubject(e)}>
                <div className='row justify-content-center'>
                  <div className='form-group col-10'>
                    {alertMessage.msg && (
                      <div
                        className={`alert alert-${alertMessage.variant}`}
                        role='alert'
                      >
                        {alertMessage.msg}
                      </div>
                    )}
                  </div>
                  <div className='form-group col-10'>
                    <label htmlFor='name'>Subject Name</label>
                    <input
                      id='name'
                      type='text'
                      className='form-control'
                      name='name'
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                    <div>
                      <sub>{errName ? errName : <>&nbsp;</>}</sub>
                    </div>
                  </div>
                  <div className='form-group col-10'>
                    <label htmlFor='textarea'>Subject Detail</label>
                    <textarea
                      className='form-control'
                      onChange={(e) => {
                        setDetail(e.target.value);
                      }}
                    ></textarea>
                    <div>
                      <sub>{errDetail ? errDetail : <>&nbsp;</>}</sub>
                    </div>
                  </div>
                  {display ? (
                    <div className='form-group col-10'>
                      <img alt='display ' src={display} width='100%' />
                    </div>
                  ) : null}
                  <div className='form-group col-10'>
                    <div className='row'>
                      <div className='col-md-8 col-12'>
                        <input
                          id='image'
                          type='file'
                          className='form-control'
                          name='image'
                          onChange={(e) => handleImage(e)}
                        />
                      </div>
                      {display ? (
                        <div className='col-md col-12'>
                          <button
                            type='button'
                            className='btn btn-danger'
                            name='image'
                            onClick={(e) => deleteImage(e)}
                          >
                            &#x2717;
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary mr-2'
                    onClick={() => history.goBack()}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={check}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSubject;
