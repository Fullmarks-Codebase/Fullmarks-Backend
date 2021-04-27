import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig";
import Loading from "../../../Loading/Loading";

export default function UpdateClass(props) {
  let history = useHistory();
  const [name, setName] = useState("");
  const [errName, setErrName] = useState("");
  const [image, setImage] = useState(null);
  const [exist, setExist] = useState(false);
  const [fu, forceUpdate] = useState(0);
  const id = props.match.params.id;

  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });

  const ignoreFirstRun = useRef(true);

  const [check, setCheck] = useState(true);
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    axiosForAdmin
      .post("/class", { id: id })
      .then((response) => {
        setName(response.data.result[0].name);
        setSelected(response.data.result[0]);
        if (response.data.result[0].class_image) {
          setExist(!exist);
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        if (err.response.status === 404) {
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
          setTimeout(() => {
            history.push("/ClassTable");
          }, 1500);
        }
        if (err.response.data)
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
      });
    // eslint-disable-next-line
  }, [fu]);

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
    // eslint-disable-next-line
  }, [errName, name]);

  const deleteImage = (event) => {
    document.getElementById(event.target.name).value = "";
    setImage(null);
  };

  const handleImage = (event) => {
    setImage(event.target.files[0]);
  };

  const updateSubject = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });

    let formData = new FormData();
    formData.append("id", selected.id);
    formData.append("name", name);
    formData.append("class_image", image);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axiosForAdmin
      .put("/class/update", formData, config)
      .then((response) => {
        setAlertMessage({ variant: "success", msg: response.data.message });
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
        if (err.response.data)
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
      });
  };

  const deleteOldImage = (event) => {
    event.preventDefault();
    const { name } = event.target;
    axiosForAdmin
      .post("/class/deleteImage", { id, class_image: name })
      .then((res) => {
        forceUpdate((n) => !n);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Update Class</h1>
          </div>
          <div className='row justify-content-center'>
            <div className='col-md-6 col-12'>
              {selected ? (
                <div className='card p-sm-5 p-3'>
                  <div className='wrapper'>
                    <form method='POST' onSubmit={(e) => updateSubject(e)}>
                      <div className='row justify-content-center'>
                        <div className='form-group col-12 mt-2'>
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
                        <div className='form-group col-11'>
                          <label htmlFor='name'>Name</label>
                          <input
                            id='name'
                            type='text'
                            className='form-control'
                            name='name'
                            required
                            defaultValue={selected.name}
                            onChange={(e) => {
                              setName(e.target.value);
                            }}
                          />
                          <div>
                            <sub>{errName ? errName : <>&nbsp;</>}</sub>
                          </div>
                        </div>
                        <div className='form-group col-11'>
                          <div className='row'>
                            {selected.class_image ? (
                              <>
                                <div className='col-md-8 col-12'>
                                  {console.log(
                                    `${process.env.REACT_APP_NODE_URL_CLASS}/${selected.class_image}`
                                  )}
                                  <img
                                    src={`${process.env.REACT_APP_NODE_URL_CLASS}/${selected.class_image}`}
                                    alt={selected.image}
                                    width='100%'
                                  />
                                </div>
                                <div className='col-md col-12'>
                                  <button
                                    type='button'
                                    className='form-control btn-danger'
                                    name='class_image'
                                    onClick={(e) => deleteOldImage(e)}
                                  >
                                    &#x2717;
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className='col-md col-12'>
                                  <input
                                    id='image'
                                    type='file'
                                    className='form-control'
                                    name='image'
                                    onChange={(e) => handleImage(e)}
                                  />
                                </div>
                                {image ? (
                                  <div className='col-md-2 col-12'>
                                    <button
                                      type='button'
                                      className='form-control btn-danger'
                                      name='image'
                                      onClick={(e) => deleteImage(e)}
                                    >
                                      &#x2717;
                                    </button>
                                  </div>
                                ) : null}
                              </>
                            )}
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
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <Loading />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
