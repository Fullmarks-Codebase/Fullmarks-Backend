import React from "react";

function NotFound(props) {
  return (
    <>
      {!props.out ? (
        <div className='main-content'>
          <section className='section'>
            <div className='section-header'>
              <h1>Page Not Found</h1>
            </div>
          </section>
          <div>
            <h5>Page you are trying to access is not found.</h5>
          </div>
        </div>
      ) : (
        <div className='section-header'>
          <h1>404 Page Not Found</h1>
        </div>
      )}
    </>
  );
}
export default NotFound;
