import React, { useState } from "react";
import { Link } from "react-router-dom";
import { axiosForAdmin } from "../../../../axiosconfig";
import "../ImageUploader.css";
const ImageUploader = () => {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  const [alertMessage, setAllertMessage] = useState({});
  // The latest recieved URL
  const [uploadedUrl, setUploadedUrl] = useState();

  // List of URLS in the present session
  const [recievedUrls, setRecievedUrls] = useState([]);
  const uploadImageBtn = (e) => {
    e.preventDefault();
    if (selectedImage) {
      setAllertMessage();
      let formData = new FormData();

      formData.append("image", selectedImage);

      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
      };

      setLoading(true);
      axiosForAdmin
        .post("imageUploader/upload", formData, config)
        .then((res) => {
          console.log(res);
          if (res.data.code === 400) {
            setAllertMessage({ type: "warning", message: res.data.message });
          }
          if (res.data.code === 200) {
            setUploadedUrl(res.data.result.url);
            setRecievedUrls([...recievedUrls, res.data.result.url]);
            setAllertMessage({ type: "success", message: "Image Uploaded" });
            setTimeout(() => {
              setAllertMessage();
            }, 6000);
            setSelectedImage();
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      alert("Select an Image");
    }
  };

  return (
    <>
      <div className='main-content'>
        <section className='section'>
          <div className='section-header'>
            <h1>Image Uploader</h1>
            <div className='section-header-breadcrumb'>
              <div className='breadcrumb-item active'>
                <Link to='/dashboard'>Dashboard</Link>
              </div>
              <div className='breadcrumb-item'>Class</div>
            </div>
          </div>
          <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
            {/* Upload section Starts */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around ",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "30vh",
                flexGrow: "3",
              }}
            >
              {/* Uplooader Section */}
              <div className='col-md-6'>
                <form
                  method='post'
                  action='#'
                  id='#'
                  onSubmit={(e) => uploadImageBtn(e)}
                >
                  {alertMessage && (
                    <div
                      className={`alert alert-${alertMessage.type}`}
                      role='alert'
                    >
                      {alertMessage.message}
                    </div>
                  )}
                  {loading ? (
                    <div class='d-flex align-items-center'>
                      <strong>Loading...</strong>
                      <div
                        className='spinner-border ml-auto'
                        role='status'
                        aria-hidden='true'
                      ></div>
                    </div>
                  ) : (
                    <>
                      <div className='form-group files color'>
                        <button
                          className='btn-primary p-2 m-1 mx-auto'
                          style={{ width: "100%" }}
                        >
                          Upload Image
                        </button>
                        <input
                          id='image-input'
                          type='file'
                          className='form-control'
                          multiple=''
                          accept='image/jpeg, image/png'
                          onChange={(e) => {
                            setSelectedImage(e.target.files[0]);
                          }}
                        />
                      </div>
                    </>
                  )}{" "}
                </form>

                {/* uploaded URL Section */}
              </div>
              <div className='col-md-6'>
                <div className='form-group '>
                  <label>URL </label>
                  <input
                    type='text'
                    readOnly
                    style={{ minHeight: "60px", maxHeight: "100px" }}
                    value={uploadedUrl || "Upload an Image"}
                    className='form-control'
                  />
                  {uploadedUrl && (
                    <img
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        maxWidth: "300px",
                      }}
                      alt={uploadedUrl}
                      src={uploadedUrl}
                    ></img>
                  )}
                </div>
              </div>
            </div>
            {/* Upload section Ends */}

            <div style={{ flexGrow: "1" }}>
              {recievedUrls.map((url) => (
                <>
                  Images Uploaded in the Current Session (Refresh will reset)
                  <div
                    key={url}
                    className='mb-2'
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <label>URL </label>
                    <input
                      type='text'
                      readOnly
                      value={url}
                      style={{ minHeight: "60px", maxHeight: "100px" }}
                      class='form-control'
                    />{" "}
                    <img
                      style={{
                        width: "30%",
                        height: "40%",
                        maxHeight: "90px",
                        maxWidth: "90px",
                      }}
                      alt={url}
                      src={url}
                    ></img>
                    <div class='dropdown-divider'></div>
                  </div>
                </>
              ))}
            </div>
          </div>
        </section>
        <div className='alert alert-info'>
          <ul className='font-weight-bold'>
            <li>Image files with size of more than 1 MB will be compressed </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default React.memo(ImageUploader);
