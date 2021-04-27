import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig";
import "../assest/QuestionForm.css";

function AddQuestion(props) {
  let history = useHistory();
  //set id
  const id = props.match.params.id;
  //others
  const subId = props.match.params.subId;
  const classId = props.match.params.classId;
  const topicId = props.match.params.topicId;
  const [valid, setValid] = useState(true);
  const [diffcult, setDiffcult] = useState("");
  // const [diffcultErr, setDiffcultErr] = useState('')
  const [question, setQuestion] = useState("");
  const [questionErr, setQuestionErr] = useState("");
  const [ans_one, setAns_one] = useState("");
  const [ans_oneErr, setAns_oneErr] = useState("");
  const [ans_two, setAns_two] = useState("");
  const [ans_twoErr, setAns_twoErr] = useState("");
  const [ans_three, setAns_three] = useState("");
  const [ans_threeErr, setAns_threeErr] = useState("");
  const [ans_four, setAns_four] = useState("");
  const [ans_fourErr, setAns_fourErr] = useState("");

  const [ans_one_status, setAns_one_status] = useState("false");
  const [ans_two_status, setAns_two_status] = useState("false");
  const [ans_three_status, setAns_three_status] = useState("false");
  const [ans_four_status, setAns_Four_status] = useState("false");

  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });

  const [imageCheck, setImageCheck] = useState({
    ans_one_image: null,
    ans_two_image: null,
    ans_three_image: null,
    ans_four_image: null,
    question_image: null,
  });
  // const [flag,setFlag] = useState(false)

  const ignore = React.useRef(true);
  useEffect(() => {
    if (ignore.current) {
      ignore.current = false;
      return;
    }
    if (question.trim().length < 5 && !imageCheck.question_image) {
      setQuestionErr("Either Image or text requried");
    } else {
      setQuestionErr("");
    }

    if (ans_one.trim().length === 0 && !imageCheck.ans_one_image) {
      setAns_oneErr("Either Image or text requried");
    } else {
      setAns_oneErr("");
    }

    if (ans_two.trim().length === 0 && !imageCheck.ans_two_image) {
      setAns_twoErr("Either Image or text requried");
    } else {
      setAns_twoErr("");
    }

    if (ans_four.trim().length === 0 && !imageCheck.ans_four_image) {
      setAns_fourErr("Either Image or text requried");
    } else {
      setAns_fourErr("");
    }

    if (ans_three.trim().length === 0 && !imageCheck.ans_three_image) {
      setAns_threeErr("Either Image or text requried");
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
    ans_fourErr,
    imageCheck,
  ]);

  const onHandleImage = (event) => {
    const { name } = event.target;
    setImageCheck({ ...imageCheck, [name]: true });
  };

  const deleteImage = (event) => {
    const { name } = event.target;
    document.getElementById(event.target.name).value = "";
    setImageCheck({ ...imageCheck, [name]: false });
  };

  const addQuestion = (e) => {
    e.preventDefault();
    setAlertMessage({ variant: "warning", msg: "Please wait" });
    let formData = new FormData();
    var ans_one_image =
      document.querySelector("#ans_one_image").files[0] || null;
    var ans_two_image =
      document.querySelector("#ans_two_image").files[0] || null;
    var ans_three_image =
      document.querySelector("#ans_three_image").files[0] || null;
    var ans_four_image =
      document.querySelector("#ans_four_image").files[0] || null;
    var question_image =
      document.querySelector("#question_image").files[0] || null;
    const key = [
      "question",
      "subjectId",
      "setId",
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
      "classId",
      "topicId",
      "difficulty_level",
    ];
    const values = [
      question,
      subId,
      id,
      ans_one,
      ans_two,
      ans_three,
      ans_four,
      ans_one_status,
      ans_two_status,
      ans_three_status,
      ans_four_status,
      ans_one_image,
      ans_two_image,
      ans_three_image,
      ans_four_image,
      question_image,
      classId,
      topicId,
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
      .post("/questions/add", formData, config)
      .then((res) => {
        setAlertMessage({ variant: "success", msg: res.data.message });
        setTimeout(() => {
          history.replace(
            `/QuestionsTable/${classId}/${subId}/${topicId}/${id}`
          );
        }, 1500);
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
        if (err.response.data)
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
      });
  };
  return (
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Add Question</h1>
          </div>
        </section>
        <div className='row justify-content-center'>
          <div className='col-md-11 col-12'>
            <div className='card'>
              <form method='POST' onSubmit={(e) => addQuestion(e)}>
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
                      {/* <div className="col-12 mb-3">
                      <button type="button" className="btn btn-primary" onClick={()=>{
                          setQuestion(""); 
                          if(!flag) 
                            setQuestion("a'"); 
                          setFlag(!flag)
                        }}>
                          {flag?'Normal Mode':'Mathematical Mode'}
                        </button>
                    </div> */}
                      <div className='col-12'>
                        <label htmlFor='question'>Question*</label>
                        <div>
                          {
                            // !flag?
                            <textarea
                              id='question'
                              type='text'
                              name='question'
                              onChange={(e) => setQuestion(e.target.value)}
                            ></textarea>
                            // :
                            //   <MathInput question={question} setQuestion={setQuestion}/>
                          }
                        </div>
                        <div>
                          <sub>{questionErr ? questionErr : <>&nbsp;</>}</sub>
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-group'>
                          <label>Diffcult Level</label>
                          <select
                            className='form-control'
                            required
                            onClick={(e) => setDiffcult(e.target.value)}
                          >
                            <option value='0'>Easy</option>
                            <option value='1'>Medium</option>
                            <option value='2'>Hard</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className='row'>
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
                      {imageCheck.question_image ? (
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
                    </div>
                  </div>
                  <div className='form-group col-md-11 col-11 mt-md-4 mt-0'>
                    <div className='row'>
                      <div className='col-md mt-md-0 mt-4'>
                        <label htmlFor='ans_one'>Option One*</label>
                        <input
                          id='ans_one'
                          type='text'
                          className='form-control'
                          name='ans_one'
                          onChange={(e) => setAns_one(e.target.value)}
                        />
                        <div>
                          <sub>{ans_oneErr ? ans_oneErr : <>&nbsp;</>}</sub>
                        </div>
                        <div className='form-group'>
                          <label>Is it Correct</label>
                          <select
                            className='form-control'
                            onClick={(e) => setAns_one_status(e.target.value)}
                          >
                            <option value='false'>No</option>
                            <option value='true'>Yes</option>
                          </select>
                        </div>
                        <div className='row'>
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
                          {imageCheck.ans_one_image ? (
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
                        </div>
                      </div>
                      <div className='col-md mt-md-0 mt-5'>
                        <label htmlFor='ans_two'>Option Two*</label>
                        <input
                          id='ans_two'
                          type='text'
                          className='form-control'
                          name='ans_two'
                          onChange={(e) => setAns_two(e.target.value)}
                        />
                        <div>
                          <sub>{ans_twoErr ? ans_twoErr : <>&nbsp;</>}</sub>
                        </div>
                        <div className='form-group'>
                          <label>Is it Correct</label>
                          <select
                            className='form-control'
                            onClick={(e) => setAns_two_status(e.target.value)}
                          >
                            <option value='false'>No</option>
                            <option value='true'>Yes</option>
                          </select>
                        </div>
                        <div className='row'>
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
                          {imageCheck.ans_two_image ? (
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
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='form-group col-md-11 col-11 mt-md-4 mt-0'>
                    <div className='row'>
                      <div className='col-md mt-md-0 mt-4'>
                        <label htmlFor='ans_three'>Option three*</label>
                        <input
                          id='ans_three'
                          type='text'
                          className='form-control'
                          name='ans_three'
                          onChange={(e) => setAns_three(e.target.value)}
                        />
                        <div>
                          <sub>{ans_threeErr ? ans_threeErr : <>&nbsp;</>}</sub>
                        </div>
                        <div className='form-group'>
                          <label>Is it Correct</label>
                          <select
                            className='form-control'
                            onClick={(e) => setAns_three_status(e.target.value)}
                          >
                            <option value='false'>No</option>
                            <option value='true'>Yes</option>
                          </select>
                        </div>
                        <div className='row'>
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
                          {imageCheck.ans_three_image ? (
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
                        </div>
                      </div>
                      <div className='col-md mt-md-0 mt-5'>
                        <label htmlFor='ans_four'>Option Four*</label>
                        <input
                          id='ans_four'
                          type='text'
                          className='form-control'
                          name='ans_four'
                          onChange={(e) => setAns_four(e.target.value)}
                        />
                        <div>
                          <sub>{ans_fourErr ? ans_fourErr : <>&nbsp;</>}</sub>
                        </div>
                        <div className='form-group'>
                          <label>Is it Correct</label>
                          <select
                            className='form-control'
                            onClick={(e) => setAns_Four_status(e.target.value)}
                          >
                            <option value='false'>No</option>
                            <option value='true'>Yes</option>
                          </select>
                        </div>
                        <div className='row'>
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
                          {imageCheck.ans_four_image ? (
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='form-group row justify-content-center'>
                  <button
                    type='submit'
                    className='btn btn-primary col-md-2 col-10'
                    disabled={valid}
                  >
                    Create
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
  );
}

export default AddQuestion;
