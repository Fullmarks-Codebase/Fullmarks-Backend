import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { codes } from "./codes";

function MathInput({ question, setQuestion }) {
  // const [text,setText] = useState("a'")
  const [syCode, setSyCode] = useState(codes[Object.keys(codes)[0]] || []);
  // categories
  const changeButtonContainer = (key) => {
    setSyCode(codes[key]);
  };

  // symbol button
  const handleChange = (code) => {
    setQuestion(question + code);
    document.getElementById("inputt").focus();
  };

  // text input
  const handleInput = (e) => {
    if (e.target.value.split("").pop() === " ") {
      setQuestion(e.target.value.slice(0, -1));
      return;
    } else {
      setQuestion(e.target.value);
    }
  };

  // space button
  const addSpace = () => {
    setQuestion(question + String.raw`\ `);
  };
  return (
    <>
      {/* <div className="main-content"> */}
      <div>
        {/* <section className="section">
                <div className="section-header">
                    <h1>Mathinput</h1>
                </div>
            </section> */}

        <div className='row justify-content-center'>
          <div className='col-10 m-1'>
            <div style={{ overflowX: "auto", minWidth: "100%" }}>
              <ul className='nav nav-tabs' style={{ flexWrap: "nowrap" }}>
                {Object.keys(codes).map((i) => {
                  return (
                    <li className=''>
                      <button
                        type='button'
                        style={{ width: "max-content" }}
                        className='nav-link active'
                        onClick={(e) => changeButtonContainer(i)}
                      >
                        {i}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className='col-10' style={{ backgroundColor: "white" }}>
            <div
              className='row justify-content-center'
              style={{
                overflow: "scroll",
                maxHeight: "200px",
                minWidth: "100%",
              }}
            >
              {syCode.map((sy, index) => {
                return (
                  <div
                    className='col'
                    style={{
                      padding: "0px",
                      paddingLeft: "0px",
                      margin: "2.5px",
                    }}
                  >
                    <button
                      type='button'
                      className='btn btn-primary'
                      style={{
                        minWidth: "100px",
                        width: "max-content",
                        fontSize: "15px",
                      }}
                      onClick={() => handleChange(sy)}
                    >
                      <InlineMath math={sy.toString()} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='col-12'>
            <textarea
              id='inputt'
              value={question}
              type='text'
              onChange={(e) => handleInput(e, false)}
            />
          </div>
          <div className='col-12'>
            <div className='row justify-content-center'>
              <div className='col-1'>
                <button
                  type='button'
                  className='btn btn-primary'
                  style={{ width: "100px" }}
                  onClick={addSpace}
                >
                  Space
                </button>
              </div>
              <div className='col-12'>
                <div
                  style={{
                    overflow: "scroll",
                    maxWidth: "max-content",
                    minWidth: "100%",
                  }}
                >
                  <BlockMath math={question.toString()} />
                </div>
              </div>
            </div>
            {/* {text} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default MathInput;
