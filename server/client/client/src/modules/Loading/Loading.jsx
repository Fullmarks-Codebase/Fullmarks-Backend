import React from "react"

let style={
  background: "#ffffff",
  color: "#666666",
  position: "fixed",
  height: "100%",
  width: "100%",
  zIndex: "5000",
  top: "0",
  left: "0",
  float: "left",
  textAlign: "center",
  paddingTop: "25%",
  opacity: ".75",
}

function Loading(){
  return (
    <div style={style}>
      <div className="spinner-grow text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="spinner-grow text-secondary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="spinner-grow text-success" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="spinner-grow text-danger" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="spinner-grow text-warning" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="spinner-grow text-info" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="spinner-grow text-dark" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default Loading