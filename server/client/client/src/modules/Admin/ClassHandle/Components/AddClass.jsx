import React, { useEffect, useState } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { useHistory } from "react-router-dom";

function AddClass() {
  let history = useHistory();
  const [name, setName] = useState("");
  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  const [errName, setErrName] = useState("");
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
    if (name.trim().length < 1) setErrName("required");
    else setErrName("");
    if (errName.length === 0) {
      setCheck(false);
    } else {
      setCheck(true);
    }
  }, [errName, name]);

  const addClass = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });
    let formData = new FormData();
    var imagefile = document.querySelector("#image");
    formData.append("name", name);
    formData.append("class_image", imagefile.files[0]);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axiosForAdmin
      .post("/class/add", formData, config)
      .then((res) => {
        setAlertMessage({ variant: "success", msg: res.data.message });
        setTimeout(() => {
          history.push("/ClassTable");
        }, 1500);
      })
      .catch((err) => {
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
          <h1>Add Class</h1>
        </div>
      </section>
      <div className='row justify-content-center'>
        <div className='col-md-6 col-12'>
          <div className='card p-sm-5 p-4'>
            <div className='wrapper'>
              <form method='POST' onSubmit={(e) => addClass(e)}>
                <div className='row justify-content-center'>
                  <div className='form-group col-12'>
                    {alertMessage.msg && (
                      <div
                        className={`alert alert-${alertMessage.variant} col-12`}
                        role='alert'
                      >
                        {alertMessage.msg}
                      </div>
                    )}
                  </div>
                </div>
                <div className='row justify-content-center'>
                  <div className='form-group col-12'>
                    <label htmlFor='name'>Class Name</label>
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
                  {display ? (
                    <div className='form-group col-12'>
                      <img alt='class ' src={display} width='100%' />
                    </div>
                  ) : null}
                  <div className='form-group col-12'>
                    <div className='row'>
                      <div className='col-md col-12'>
                        <input
                          id='image'
                          type='file'
                          className='form-control'
                          name='image'
                          onChange={(e) => handleImage(e)}
                        />
                      </div>
                      {display ? (
                        <div className='col-md-3 col-12'>
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
                    onClick={() => history.push("/ClassTable")}
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

export default AddClass;
