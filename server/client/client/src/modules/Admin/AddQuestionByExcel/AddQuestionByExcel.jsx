import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { axiosForAdmin } from "../../../axiosconfig";
import Loading from "../../Loading/Loading";

function AddQuestionByExcel(props) {
  let history = useHistory();

  const [alertMessage, setAlertMessage] = useState({
    variant: "",
    msg: null,
  });
  const [loading, setLoading] = useState(false);
  const [click, setClick] = useState("default");
  const [mocks, setMocks] = useState();
  const [classes, setClasses] = useState();
  const [selectedClass, setSelectedClass] = useState();
  const [selectedMock, setSelectedMock] = useState();
  const [selectedSubjectId, setSelectedSubjectId] = useState();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    axiosForAdmin
      .get("subjects/fixSubject")
      .then((response) => {
        // console.table(response.data.result);
        setSubjects(response.data.result);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
      });

    if (props?.location?.state?.classId) {
      setClick("mock");
    }
    axiosForAdmin
      .post("class")
      .then((response) => {
        setClasses(response.data.result);
        setLoading(false);
        if (props?.location?.state?.classId) {
          fetchMock(props?.location?.state?.classId);
          setSelectedClass(props?.location?.state?.classId);
        }
        // console.log(response.data.result);
      })
      .catch((error) => {
        if (error.response)
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  const fetchMock = async (classId) => {
    try {
      let response = await axiosForAdmin.post("mock", { classId });

      // console.table(response.data.result);
      setMocks(response.data.result);
      if (props?.location?.state?.mockId) {
        setSelectedMock(props?.location?.state?.mockId);
      } else if (response.data.result.length <= 0) {
        setSelectedMock();
      }

      setLoading(false);
    } catch (error) {
      console.log(error.response);
      setLoading(false);
    }
  };

  const changeClass = async (classId) => {
    if (parseInt(classId) === -1) {
      setSelectedClass();
    } else {
      setSelectedClass(classId);
    }
    fetchMock(classId);
    setSelectedMock(-1);
  };
  const addQuestions = (e) => {
    e.preventDefault();
    setLoading(true);

    var imagefile = document.querySelector("#questions");
    // var questions_image = document.querySelector("#question_image");
    // var answers_image = document.querySelector("#answers_image");

    setAlertMessage({ variant: "warning", msg: "Please wait" });

    let formData = new FormData();

    formData.append(
      "questions",
      imagefile.files.length > 0 ? imagefile.files[0] : null
    );
    // formData.append(
    //   "question_image",
    //   questions_image.files.length > 0 ? questions_image.files[0] : null
    // );
    // formData.append(
    //   "answers_image",
    //   answers_image.files.length > 0 ? answers_image.files[0] : null
    // );
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    if (selectedClass && selectedClass !== -1)
      formData.append("classId", selectedClass);

    if (selectedMock && selectedMock !== -1)
      formData.append("mockId", selectedMock);

    if (selectedSubjectId && selectedSubjectId !== -1)
      formData.append("fixSubjectId", selectedSubjectId);
    axiosForAdmin
      .post(`/addQuestion${click === "mock" ? "/mock" : ""}`, formData, config)
      .then((res) => {
        setLoading(false);
        // console.log(res);
        let recievedMockId = res?.data?.result?.mockId;
        setAlertMessage({ variant: "success", msg: res.data.message });
        setTimeout(() => {
          if (click === "mock") {
            history.push("/MockQuestionsTable/" + recievedMockId);
          }
        }, 2000);
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.data?.message)
          setAlertMessage({
            variant: "danger",
            msg: err.response.data.message,
          });
        if (err.response) {
          if (err.response.status)
            if (err.response.status === 403) {
              localStorage.clear("token");
              window.location.replace("/");
            }
        }
        // console.log(err.response);
        // setAlertMessage({ variant: "danger", msg: "Internal Server Error" });
      });
  };

  const resetInput = (mode) => {
    setClick(mode);
    document.getElementById("questions").value = "";
    // document.getElementById("question_image").value = "";
    // document.getElementById("answers_image").value = "";
  };

  return (
    <>
      {!loading ? (
        <>
          <div className='main-content'>
            <section className='section'>
              <div className='section-header'>
                <h1>Upload Questions</h1>
              </div>

              <div className='row justify-content-center'>
                <div className='col-md-6 col-12'>
                  <ul className='nav nav-tabs'>
                    <li className='nav-item pointer'>
                      <div
                        onClick={() => {
                          resetInput("default");
                          setAlertMessage();
                        }}
                        className={`font-weight-bold nav-link  ${
                          click === "default" ? "active" : null
                        }`}
                      >
                        Fix Subject Question
                      </div>
                    </li>
                    <li className='nav-item pointer'>
                      <div
                        onClick={() => {
                          resetInput("mock");
                          setAlertMessage();
                        }}
                        className={`font-weight-bold nav-link pointer ${
                          click === "mock" ? "active" : null
                        }`}
                      >
                        Mock Question
                      </div>
                    </li>
                  </ul>

                  <div className='card p-md-5 p-5'>
                    <div className='wrapper'>
                      <form method='POST' onSubmit={(e) => addQuestions(e)}>
                        <div className='row justify-content-center'>
                          <div className='form-group col-11'>
                            {alertMessage && alertMessage.msg && (
                              <div
                                className={`alert alert-${alertMessage.variant}`}
                                role='alert'
                              >
                                {alertMessage.msg}
                              </div>
                            )}
                          </div>
                          <div className='form-group col-11'>
                            {click === "default" ? (
                              ""
                            ) : props?.location?.state?.classId &&
                              props?.location?.state?.mockId ? (
                              <div className='text-center'>
                                <span className='mr-3 font-weight-bold'>
                                  Class :{" "}
                                  {classes &&
                                    classes
                                      .filter((c) => c.id === selectedClass)
                                      .map((c) => c.name)}
                                </span>
                                <span className='mr-3 font-weight-bold'>
                                  Mock :{" "}
                                  {mocks &&
                                    mocks
                                      .filter((m) => m.id === selectedMock)
                                      .map((m) => m.name)}
                                </span>
                                <label className='ml-2' htmlFor='subjectSelect'>
                                  Subject:
                                </label>

                                <select
                                  name='subjectSelect'
                                  id='subjectSelect'
                                  defaultValue={-1}
                                  onChange={(e) => {
                                    if (parseInt(e.target.value) !== -1) {
                                      setSelectedSubjectId(
                                        parseInt(e.target.value)
                                      );
                                    } else setSelectedSubjectId();
                                  }}
                                >
                                  <option value={-1}> Select a Subject</option>
                                  {!selectedClass ? (
                                    <option disabled value={-1}>
                                      Class not selected
                                    </option>
                                  ) : subjects && subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                      <option
                                        key={subject.id}
                                        value={parseInt(subject.id)}
                                      >
                                        {subject.name}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled value={-1}>
                                      No subject in this Class
                                    </option>
                                  )}
                                </select>
                              </div>
                            ) : (
                              <div className='mb-2'>
                                {/* CLASS SELECTOR */}
                                <label htmlFor='classSelect'>Class:</label>

                                <select
                                  name='classSelect'
                                  id='classSelect'
                                  defaultValue={
                                    parseInt(props?.location?.state?.classId) ||
                                    -1
                                  }
                                  onChange={(e) => {
                                    setLoading(false);
                                    changeClass(parseInt(e.target.value));
                                  }}
                                >
                                  <option value={-1} disabled>
                                    Select a class
                                  </option>
                                  {classes &&
                                    classes.map((c) => (
                                      <option key={c.id} value={parseInt(c.id)}>
                                        {c.name}
                                      </option>
                                    ))}
                                </select>

                                {/* MOCK SELECTOR */}
                                <label
                                  className='ml-2'
                                  htmlFor='mockMasterSelect'
                                >
                                  Mock:
                                </label>

                                <select
                                  name='mockMasterSelect'
                                  id='mockMasterSelect'
                                  defaultValue={
                                    props.location.state
                                      ? parseInt(
                                          props?.location?.state?.classId
                                        )
                                      : -1
                                  }
                                  onChange={(e) => {
                                    if (parseInt(e.target.value) !== -1) {
                                      setSelectedMock(parseInt(e.target.value));
                                    } else setSelectedMock();
                                  }}
                                  onClick={(e) => {
                                    if (parseInt(e.target.value) !== -1) {
                                      setSelectedMock(parseInt(e.target.value));
                                    } else setSelectedMock();
                                  }}
                                >
                                  <option value={-1}> Select a mock</option>
                                  {!selectedClass ? (
                                    <option disabled>
                                      Select a class first
                                    </option>
                                  ) : mocks && mocks.length > 0 ? (
                                    mocks.map((mock) => (
                                      <option
                                        key={mock.id}
                                        value={parseInt(mock.id)}
                                      >
                                        {mock.name}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled selected>
                                      No Mocks in this Class
                                    </option>
                                  )}
                                </select>
                                {/* Subject Selector */}
                                <label className='ml-2' htmlFor='subjectSelect'>
                                  Subject:
                                </label>

                                <select
                                  name='subjectSelect'
                                  id='subjectSelect'
                                  defaultValue={-1}
                                  onChange={(e) => {
                                    if (parseInt(e.target.value) !== -1) {
                                      setSelectedSubjectId(
                                        parseInt(e.target.value)
                                      );
                                    } else setSelectedSubjectId();
                                  }}
                                >
                                  <option value={-1} disabled>
                                    {" "}
                                    Select a Subject{" "}
                                  </option>
                                  {subjects && subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                      <option
                                        key={subject.id}
                                        value={parseInt(subject.id)}
                                      >
                                        {subject.name}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled selected>
                                      No subject in this Class
                                    </option>
                                  )}
                                </select>
                              </div>
                            )}
                            <label>
                              {click === "default"
                                ? "Question Excel file:"
                                : "Mock Question Excel file:"}
                            </label>
                            <input
                              type='file'
                              id='questions'
                              name='questions'
                              className='form-control col-12'
                            />
                          </div>

                          {/* <div className='form-group col-11'>
                        <label>Upload Questions Image Zip File:</label>
                        <input
                          type='file'
                          id='question_image'
                          className='form-control col-12'
                        />
                      </div> */}
                          {/* <div className='form-group col-11'>
                        <label>Upload Answer Image Zip File:</label>
                        <input
                          type='file'
                          id='answers_image'
                          className='form-control col-12'
                        />
                      </div> */}
                        </div>
                        <div className='modal-footer'>
                          <button
                            type='button'
                            className='btn btn-secondary mr-2'
                            onClick={() => history.push("/dashboard")}
                          >
                            Cancel
                          </button>
                          <button type='submit' className='btn btn-primary'>
                            Create
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  {click !== "default" && (
                    <div className='alert alert-info'>
                      <ul className='font-weight-bold'>
                        Instructions
                        <li>
                          if class is not selected - 'class' column is required
                          in excel file
                        </li>
                        <li>
                          if mock is not selected - 'mock_name' column is
                          required in excel file
                        </li>
                        <li>
                          if subject is not selected - 'subject_name' column is
                          required in excel file
                        </li>
                        <li>
                          The subjects listed on the subject picker are the
                          subjects of the selected class.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default React.memo(AddQuestionByExcel);
