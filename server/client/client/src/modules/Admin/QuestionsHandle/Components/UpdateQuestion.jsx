import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig";
import urlCheck from "../../../../utils/urlCheck";
import Loading from "../../../Loading/Loading";
import "../assest/QuestionForm.css";

function UpdateQuestion(props) {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [deleteButton, setDeleteButton] = useState({
    question_image: true,
    ans_one_image: true,
    ans_two_image: true,
    ans_three_image: true,
    ans_four_image: true,
  });
  const [selected, setSelected] = useState({});
  const [valid, setValid] = useState(true);
  const [diffcult, setDiffcult] = useState("");
  const [question, setQuestion] = useState("");
  const [questionErr, setQuestionErr] = useState("Required");
  const [ans_one, setAns_one] = useState("");
  const [ans_oneErr, setAns_oneErr] = useState("Required");
  const [ans_two, setAns_two] = useState("");
  const [ans_twoErr, setAns_twoErr] = useState("Required");
  const [ans_three, setAns_three] = useState("");
  const [ans_threeErr, setAns_threeErr] = useState("Required");
  const [ans_four, setAns_four] = useState("");
  const [ans_fourErr, setAns_fourErr] = useState("Required");
  const [ans_one_status, setAns_one_status] = useState("false");
  const [ans_two_status, setAns_two_status] = useState("false");
  const [ans_three_status, setAns_three_status] = useState("false");
  const [ans_four_status, setAns_Four_status] = useState("false");
  const id = props.match.params.id;

  const [image, setImage] = useState({
    question_image: null,
    ans_one_image: null,
    ans_two_image: null,
    ans_three_image: null,
    ans_four_image: null,
  });

  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });

  useEffect(() => {
    axiosForAdmin
      .post("/questions", { questionId: id })
      .then((res) => {
        setSelected(res.data.result[0]);
        setQuestion(res.data.result[0].question);
        setAns_one(res.data.result[0].ans_one || null);
        setAns_two(res.data.result[0].ans_two);
        setAns_three(res.data.result[0].ans_three);
        setAns_four(res.data.result[0].ans_four);
        setAns_one_status(res.data.result[0].ans_one_status);
        setAns_two_status(res.data.result[0].ans_two_status);
        setAns_three_status(res.data.result[0].ans_three_status);
        setAns_Four_status(res.data.result[0].ans_four_status);
        setDiffcult(res.data.result[0].difficulty_level);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        if (err?.response?.status === 404) {
          setAlertMessage({
            variant: "danger",
            msg: err.response?.data?.message || "",
          });
          setTimeout(() => {
            history.push("/dashboard");
          }, 2000);
        }
        if (err.response) {
          if (err.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        setAlertMessage({
          variant: "danger",
          msg: err.response?.data?.message || "",
        });
      });
    // eslint-disable-next-line
  }, [deleteButton]);

  const onHandleImage = (event) => {
    const { name, files } = event.target;
    setImage({ ...image, [name]: files[0] || null });
  };
  const deleteImage = (event) => {
    const { name } = event.target;
    document.getElementById(name).value = "";
    setImage({ ...image, [name]: null });
  };

  const deleteOldImage = (event) => {
    const { name } = event.target;
    axiosForAdmin
      .post("/questions/deleteImage", { id, image_field: name })
      .then((res) => {
        setDeleteButton({ ...deleteButton, [name]: true });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const ignore = React.useRef(true);
  useEffect(() => {
    if (ignore.current) {
      ignore.current = false;
      return;
    }
    if (
      question?.trim().length === 0 &&
      !image.question_image &&
      !selected.question_image
    ) {
      setQuestionErr("Either image or question");
    } else {
      setQuestionErr("");
    }
    if (
      ans_one?.trim().length === 0 &&
      !image.ans_one_image &&
      !selected.ans_one_image
    ) {
      setAns_oneErr("Either image or answer");
    } else {
      setAns_oneErr("");
    }

    if (
      ans_two.trim().length === 0 &&
      !image.ans_two_image &&
      !selected.ans_two_image
    ) {
      setAns_twoErr("Either image or answer");
    } else {
      setAns_twoErr("");
    }

    if (
      ans_four.trim().length === 0 &&
      !image.ans_four_image &&
      !selected.ans_four_image
    ) {
      setAns_fourErr("Either image or answer");
    } else {
      setAns_fourErr("");
    }
    if (
      ans_three.trim().length === 0 &&
      !image.ans_three_image &&
      !selected.ans_three_image
    ) {
      setAns_threeErr("Either image or answer");
    } else {
      setAns_threeErr("");
    }
    if (
      questionErr.length === 0 &&
      ans_oneErr.length === 0 &&
      ans_twoErr.length === 0 &&
      ans_fourErr.length === 0 &&
      ans_threeErr.length === 0
    ) {
      setValid(false);
    } else {
      setValid(true);
    }
    // eslint-disable-next-line
  }, [
    valid,
    question,
    questionErr,
    ans_one,
    ans_oneErr,
    ans_two,
    ans_twoErr,
    ans_three,
    ans_threeErr,
    ans_four,
    image,
    ans_fourErr,
  ]);

  const updateQuestion = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });
    let formData = new FormData();
    const key = [
      "id",
      "question",
      "ans_one",
      "ans_two",
      "ans_three",
      "ans_four",
      "ans_one_status",
      "ans_two_status",
      "ans_three_status",
      "ans_four_status",
      "ans_one_image",
      "ans_two_image",
      "ans_three_image",
      "ans_four_image",
      "question_image",
      "difficulty_level",
    ];

    const values = [
      id,
      question,
      ans_one,
      ans_two,
      ans_three,
      ans_four,
      ans_one_status,
      ans_two_status,
      ans_three_status,
      ans_four_status,
      image.ans_one_image,
      image.ans_two_image,
      image.ans_three_image,
      image.ans_four_image,
      image.question_image,
      diffcult,
    ];
    for (let i = 0; i < key.length; i++) {
      formData.append(key[i], values[i]);
    }
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axiosForAdmin
      .put("/questions/updateQuestion", formData, config)
      .then((res) => {
        setAlertMessage({ variant: "success", msg: res.data.message });
        setTimeout(() => {
          history.goBack();
        }, 1200);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
          setTimeout(() => {
            history.push(`/dashboard`);
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
    <>
      {!loading ? (
        <>
          <div className='main-content'>
            <section className='section'>
              <div className='section-header'>
                <h1>Update Question</h1>
              </div>
            </section>
            <div className='row justify-content-center'>
              <div className='col-md-11 col-12'>
                <div className='card'>
                  <form onSubmit={(e) => updateQuestion(e)} method='POST'>
                    <div className='row justify-content-center mt-4'>
                      {alertMessage.msg && (
                        <div
                          class={`alert alert-${alertMessage.variant} col-10 mt-3`}
                          role='alert'
                        >
                          {alertMessage.msg}
                        </div>
                      )}
                    </div>
                    <div className='row justify-content-center mt-4'>
                      <div className='form-group col-md-11 col-11'>
                        <div className='row'>
                          <div className='col-12'>
                            <label htmlFor='question'>
                              <b>Question*</b>
                            </label>
                            <div>
                              <textarea
                                id='question'
                                type='text'
                                name='question'
                                defaultValue={selected.question}
                                onChange={(e) => setQuestion(e.target.value)}
                              ></textarea>
                            </div>
                            <div>
                              <sub>
                                {questionErr ? questionErr : <>&nbsp;</>}
                              </sub>
                            </div>
                          </div>
                          <div className='col'>
                            <div className='form-group'>
                              <label>Diffcult Level</label>
                              <select
                                className='form-control'
                                defaultValue={selected.difficulty_level}
                                onClick={(e) => setDiffcult(e.target.value)}
                              >
                                <option disabled value={null}>
                                  select option
                                </option>
                                <option value='0'>Easy</option>
                                <option value='1'>Medium</option>
                                <option value='2'>Hard</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className='row justify-content-start'>
                          {selected.question_image ? (
                            <>
                              <div className='col-md-6 col-12'>
                                <img
                                  src={
                                    urlCheck(selected.question_image)
                                      ? selected.question_image
                                      : `${process.env.REACT_APP_NODE_URL_QUESTION}/${selected.question_image} `
                                  }
                                  alt={"selected.question_image"}
                                  width='100%'
                                />
                              </div>
                              <div className='col-md-2 col-12'>
                                <button
                                  type='button'
                                  className={`form-control btn-danger`}
                                  name='question_image'
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
                                  id='question_image'
                                  type='file'
                                  className='form-control'
                                  name='question_image'
                                  onChange={(e) => {
                                    onHandleImage(e);
                                  }}
                                />
                              </div>
                              {image.question_image ? (
                                <div className='col-md-3 mt-3 mt-md-0 col-12'>
                                  <button
                                    type='button'
                                    className='form-control btn-danger'
                                    name='question_image'
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
                      <div className='form-group col-md-11 col-11 mt-md-4 mt-0'>
                        <div className='row'>
                          <div className='col-md mt-md-0 mt-5'>
                            <label htmlFor='ans_one'>Option One</label>
                            <input
                              id='ans_one'
                              type='text'
                              className='form-control'
                              name='ans_one'
                              defaultValue={ans_one}
                              onChange={(e) => setAns_one(e.target.value)}
                            />
                            <div>
                              <sub>{ans_oneErr ? ans_oneErr : <>&nbsp;</>}</sub>
                            </div>
                            <div className='form-group'>
                              <label>Is it Correct Answer</label>
                              <select
                                className='form-control'
                                defaultValue={selected.ans_one_status}
                                onClick={(e) =>
                                  setAns_one_status(e.target.value)
                                }
                              >
                                <option value={false}>No</option>
                                <option value={true}>Yes</option>
                              </select>
                            </div>
                            <div className='row'>
                              {selected.ans_one_image ? (
                                <>
                                  <div className='col-md-8 col-12'>
                                    <img
                                      src={
                                        urlCheck(selected.ans_one_image)
                                          ? selected.ans_one_image
                                          : `${process.env.REACT_APP_NODE_URL_QUESTION}/${selected.ans_one_image} `
                                      }
                                      alt={"ans_image_one"}
                                      width='100%'
                                    />
                                  </div>
                                  <div className='col-md col-12'>
                                    <button
                                      type='button'
                                      className={`form-control btn-danger`}
                                      name='ans_one_image'
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
                                      id='ans_one_image'
                                      type='file'
                                      className='form-control'
                                      name='ans_one_image'
                                      onChange={(e) => {
                                        onHandleImage(e);
                                      }}
                                    />
                                  </div>
                                  {image.ans_one_image ? (
                                    <div className='col-md-3 mt-3 mt-md-0 col-12'>
                                      <button
                                        type='button'
                                        className='form-control btn-danger'
                                        name='ans_one_image'
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
                          <div className='col-md mt-md-0 mt-5'>
                            <label htmlFor='ans_two'>Option Two</label>
                            <input
                              id='ans_two'
                              type='text'
                              className='form-control'
                              name='ans_two'
                              defaultValue={ans_two}
                              onChange={(e) => setAns_two(e.target.value)}
                            />
                            <div>
                              <sub>{ans_twoErr ? ans_twoErr : <>&nbsp;</>}</sub>
                            </div>
                            <div className='form-group'>
                              <label>Is it Correct Answer</label>
                              <select
                                className='form-control'
                                defaultValue={selected.ans_two_status}
                                onClick={(e) =>
                                  setAns_two_status(e.target.value)
                                }
                              >
                                <option value={false}>No</option>
                                <option value={true}>Yes</option>
                              </select>
                            </div>
                            <div className='row'>
                              {selected.ans_two_image ? (
                                <>
                                  <div className='col-md-8 col-12'>
                                    <img
                                      src={
                                        urlCheck(selected.ans_two_image)
                                          ? selected.ans_two_image
                                          : `${process.env.REACT_APP_NODE_URL_QUESTION}/${selected.ans_two_image} `
                                      }
                                      alt={"ans_two_image"}
                                      width='100%'
                                    />
                                  </div>
                                  <div className='col-md col-12'>
                                    <button
                                      type='button'
                                      className={`form-control btn-danger`}
                                      name='ans_two_image'
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
                                      id='ans_two_image'
                                      type='file'
                                      className='form-control'
                                      name='ans_two_image'
                                      onChange={(e) => {
                                        onHandleImage(e);
                                      }}
                                    />
                                  </div>
                                  {image.ans_two_image ? (
                                    <div className='col-md-3 mt-3 mt-md-0 col-12'>
                                      <button
                                        type='button'
                                        className='form-control btn-danger'
                                        name='ans_two_image'
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
                      </div>
                      <div className='form-group col-md-11 col-11 mt-md-4 mt-0'>
                        <div className='row'>
                          <div className='col-md mt-md-0 mt-5'>
                            <label htmlFor='ans_three'>Option three</label>
                            <input
                              id='ans_three'
                              type='text'
                              className='form-control'
                              name='ans_three'
                              defaultValue={ans_three}
                              onChange={(e) => setAns_three(e.target.value)}
                            />
                            <div>
                              <sub>
                                {ans_threeErr ? ans_threeErr : <>&nbsp;</>}
                              </sub>
                            </div>
                            <div className='form-group'>
                              <label>Is it Correct Answer</label>
                              <select
                                className='form-control'
                                defaultValue={selected.ans_three_status}
                                onClick={(e) =>
                                  setAns_three_status(e.target.value)
                                }
                              >
                                <option value={false}>No</option>
                                <option value={true}>Yes</option>
                              </select>
                            </div>
                            <div className='row'>
                              {selected.ans_three_image ? (
                                <>
                                  <div className='col-md-8 col-12'>
                                    <img
                                      src={
                                        urlCheck(selected.ans_three_image)
                                          ? selected.ans_three_image
                                          : `${process.env.REACT_APP_NODE_URL_QUESTION}/${selected.ans_three_image} `
                                      }
                                      alt={"ans_three_image"}
                                      width='100%'
                                    />
                                  </div>
                                  <div className='col-md col-12'>
                                    <button
                                      type='button'
                                      className={`form-control btn-danger`}
                                      name='ans_three_image'
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
                                      id='ans_three_image'
                                      type='file'
                                      className='form-control'
                                      name='ans_three_image'
                                      onChange={(e) => {
                                        onHandleImage(e);
                                      }}
                                    />
                                  </div>
                                  {image.ans_three_image ? (
                                    <div className='col-md-3 mt-3 mt-md-0 col-12'>
                                      <button
                                        type='button'
                                        className='form-control btn-danger'
                                        name='ans_three_image'
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
                          <div className='col-md mt-md-0 mt-5'>
                            <label htmlFor='ans_four'>Option Four</label>
                            <input
                              id='ans_four'
                              type='text'
                              className='form-control'
                              name='ans_four'
                              defaultValue={ans_four}
                              onChange={(e) => setAns_four(e.target.value)}
                            />
                            <div>
                              <sub>
                                {ans_fourErr ? ans_fourErr : <>&nbsp;</>}
                              </sub>
                            </div>
                            <div className='form-group'>
                              <label>Is it Correct Answer</label>
                              <select
                                className='form-control'
                                defaultValue={selected.ans_four_status}
                                onClick={(e) =>
                                  setAns_Four_status(e.target.value)
                                }
                              >
                                <option value={false}>No</option>
                                <option value={true}>Yes</option>
                              </select>
                            </div>
                            <div className='row'>
                              {selected.ans_four_image ? (
                                <>
                                  <div className='col-md-8 col-12'>
                                    <img
                                      src={
                                        urlCheck(selected.ans_four_image)
                                          ? selected.ans_four_image
                                          : `${process.env.REACT_APP_NODE_URL_QUESTION}/${selected.ans_four_image} `
                                      }
                                      alt={"ans_four_image"}
                                      width='100%'
                                    />
                                  </div>
                                  <div className='col-md col-12'>
                                    <button
                                      type='button'
                                      className={`form-control btn-danger`}
                                      name='ans_four_image'
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
                                      id='ans_four_image'
                                      type='file'
                                      className='form-control'
                                      name='ans_four_image'
                                      onChange={(e) => {
                                        onHandleImage(e);
                                      }}
                                    />
                                  </div>
                                  {image.ans_four_image ? (
                                    <div className='col-md-3 mt-3 mt-md-0 col-12'>
                                      <button
                                        type='button'
                                        className='form-control btn-danger'
                                        name='ans_four_image'
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
                      </div>
                    </div>
                    <div className='row justify-content-center mt-3 mb-5'>
                      <button
                        type='submit'
                        className='btn btn-primary col-md-2 col-10'
                        disabled={valid}
                      >
                        Update
                      </button>
                      <span className='col-md-0 col-md-1 m-2'></span>
                      <button
                        type='button'
                        className='btn btn-secondary col-md-2 col-10'
                        onClick={() => history.goBack()}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default React.memo(UpdateQuestion);
