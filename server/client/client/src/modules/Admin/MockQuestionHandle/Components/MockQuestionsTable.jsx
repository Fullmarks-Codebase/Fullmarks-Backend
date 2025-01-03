import React, { useState, useEffect } from "react";
import { axiosForAdmin } from "../../../../axiosconfig";
import { useHistory } from "react-router-dom";
import { convertDate } from "../../../../utils/helper";

function MockQuestionsTable(props) {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const [mock, setMock] = useState("");
  const [subjectCount, setSubjectCount] = useState([]);
  const [refreshTable, setRefreshTable] = useState(true);
  const id = props.match.params.id;
  useEffect(() => {
    axiosForAdmin
      .post("/mockQuestions/byMockId", { mockId: id })
      .then((response) => {
        setSubjectCount(response.data.result.count);
        setQuestions(response.data.result.questions);
        setMock(response.data.result.mock);
        console.log(response.data.result.count);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
        setLoading(false);
      });
    //eslint-disable-next-line
  }, [refreshTable]);

  const deleteQuestion = () => {
    axiosForAdmin
      .delete(`/mockQuestions/${selectedQuestion.id}`)
      .then((response) => {
        setRefreshTable(!refreshTable);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 403) {
            localStorage.clear("token");
            window.location.replace("/");
          }
        }
      });
  };

  return (
    <>
      <div className='main-content fix'>
        <section className='section'>
          <div className='section-header'>
            <h1> {mock && mock.name} </h1>
            <div>
              {" "}
              <span className='text-success mr-1 ml-3 font-weight-bold'>
                Correct Marks: {mock && mock.correct_marks}
              </span>
              <span className='text-danger mr-1 ml-1 font-weight-bold'>
                Incorrect Marks: {mock && mock.incorrect_marks}
              </span>
              <span className='text-warning mr-1 ml-1 font-weight-bold'>
                Time:{" "}
                {mock &&
                  `${(mock.time / 60).toFixed(0)}m:${(mock.time % 60).toFixed(
                    0
                  )}s`}
              </span>
              <span className='text-info mr-1 ml-1 font-weight-bold'>
                Total Questions: {questions && questions.length}
              </span>
            </div>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item active'>
                <a href='/#'>Dashboard</a>
              </div>
              <div className='breadcrumb-item'>Mock Questions</div>
            </div>
          </div>
          <div>
            <button
              type='button'
              className='btn btn-primary mb-3 col-12 col-md-2'
              onClick={() => history.push(`/MockQuestion/AddQuestion/${id}`)}
            >
              Create Question
            </button>
            <button
              type='button'
              className='btn btn-primary mb-3 ml-3 col-12 col-md-2'
              onClick={() =>
                history.push({
                  pathname: "/AddQuestionByExcel",
                  state: {
                    mockId: mock?.id,
                    classId: mock?.classId,
                  },
                })
              }
            >
              Add Question with excel
            </button>
            <div
              style={{
                marginLeft: "20px",
                background: "white",
                maxWidth: "max-content",
                padding: "20px",
                display: "inline-block",
                borderRadius: "50px",
                wordWrap: "break-word",
                boxShadow: "0px 5px 4px #80808085",
              }}
            >
              {subjectCount &&
                subjectCount.length > 0 &&
                subjectCount.map((subject) => (
                  <>
                    <span
                      key={subject.fixSubjectId}
                      style={{
                        wordWrap: "break-word",
                        marginLeft: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {subject?.fix_subject?.name
                        ? subject?.fix_subject?.name + ":"
                        : ""}{" "}
                    </span>
                    <span style={{ marginRight: "4px" }}>
                      {" "}
                      {subject?.subjectCount || ""}
                    </span>
                  </>
                ))}
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
              <div className='table-responsive'>
                <table className='table table-striped table-hover'>
                  <thead>
                    <tr>
                      <th scope='col' className='text-center'>
                        Id
                      </th>
                      <th scope='col' className='text-center'>
                        Question
                      </th>
                      <th scope='col' className='text-center'>
                        CreatedAt
                      </th>
                      <th scope='col' className='text-center'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr key='none'>
                        <td colSpan='4' align='center'>
                          <b>
                            <div
                              className='spinner-border text-secondary'
                              role='status'
                            >
                              <span className='sr-only'>Loading...</span>
                            </div>
                          </b>
                        </td>
                      </tr>
                    ) : questions.length < 1 ? (
                      <tr>
                        <td colSpan='4' align='center'>
                          <b>No Data round...</b>
                        </td>
                      </tr>
                    ) : (
                      questions.map((question, index) => (
                        <tr align='center' key={index + 1}>
                          <th scope='row'>{index + 1}</th>
                          <td id='overflowField'>{question.question || "-"}</td>
                          <td className='w-25'>
                            {convertDate(question.createdAt)}
                          </td>
                          <td className='w-25'>
                            <button
                              type='button'
                              onClick={() =>
                                history.push({
                                  pathname: `/MockQuestion/UpdateQuestion/${question.id}`,
                                  mockId: id,
                                })
                              }
                              className='btn btn-primary mr-2'
                            >
                              Update
                            </button>
                            <button
                              type='button'
                              data-toggle='modal'
                              onClick={() => setSelectedQuestion(question)}
                              data-target='#deleteSubject'
                              className='btn btn-danger'
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div
        className='modal fade'
        id='deleteSubject'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='exampleModalLabel'>
                Delete Subject
              </h5>
              <button
                type='button'
                className='close'
                data-dismiss='modal'
                aria-label='Close'
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
            <div className='modal-body'>
              <div className='row'>
                <div className='form-group col-12'>
                  <label htmlFor='first_name'>
                    Are you sure to remove question "{selectedQuestion.id}" ?{" "}
                  </label>
                </div>
              </div>
              <button
                type='button'
                className='btn btn-secondary mr-2'
                data-dismiss='modal'
              >
                Close
              </button>
              <button
                type='button'
                className='btn btn-danger'
                data-dismiss='modal'
                onClick={deleteQuestion}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(MockQuestionsTable);
