import React from "react";
import urlCheck from "../../../../utils/urlCheck";

const Post = ({ item, styles, onClickItem, selectedId, setDeletePostId }) => {
  // console.log(item);
  let question = JSON.parse(item?.question);
  // console.log(question);
  // console.log(item.id);
  return (
    <div
      className='card'
      style={{
        ...styles.postContainer,
        ...(selectedId === item.id ? { backgroundColor: "#d7e0e8" } : {}),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "5px",
          marginBottom: "20px",
          height: "50px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            // padding: "5px",
          }}
        >
          <img
            src={
              item?.user?.thumbnail
                ? urlCheck(item?.user?.thumbnail)
                  ? item?.user?.thumbnail
                  : `${process.env.REACT_APP_NODE_URL_USER}/${item?.user?.thumbnail}`
                : "https://e-fullmarks.s3.amazonaws.com/uploadedImages/Profile_avatar_placeholder_large_1618395327151.png"
            }
            alt='Avatar'
            loading='lazy'
            style={styles.avatar}
          ></img>
          <h6>{item?.user?.username}</h6>
        </div>
        <button
          className='mt-2 ml-2 btn btn-info'
          onClick={(e) => onClickItem(item.id)}
        >
          Show Comments
        </button>
      </div>

      {question &&
        question.map((que, index) => (
          <div key={index}>
            {que.insert &&
              que.insert.length > 0 &&
              (que.insert.length > 1 && que.insert[0] !== "/n"
                ? true
                : false) && (
                <div
                  className='card-body'
                  style={{
                    padding: "4px 8px ",
                    // borderRadius: "1px",
                    minWidth: "250px",
                    width: "75%",
                    backgroundColor: "white",
                  }}
                >
                  <p className='card-text' style={{ color: "black" }}>
                    {que.insert}{" "}
                    {que.attributes && que.attributes.a && (
                      <a
                        href={que.attributes.a}
                        target='_blank'
                        rel='noreferrer'
                        style={{ overflow: "hidden" }}
                      >
                        ({que.attributes.a})
                      </a>
                    )}
                  </p>
                </div>
              )}
            {que.attributes &&
              que.attributes.embed &&
              que.attributes.embed.type === "image" && (
                <a
                  target='_blank'
                  rel='noreferrer'
                  href={
                    urlCheck(que.attributes.embed.source)
                      ? que.attributes.embed.source
                      : `${process.env.REACT_APP_NODE_URL_POST}/${que.attributes.embed.source}`
                  }
                >
                  <img
                    style={{
                      maxWidth: "250px",
                      // maxHeight: "250px",
                      heigtht: "auto",
                    }}
                    loading='lazy'
                    className='card-img-top'
                    src={
                      urlCheck(que.attributes.embed.source)
                        ? que.attributes.embed.source
                        : `${process.env.REACT_APP_NODE_URL_POST}/${que.attributes.embed.source}`
                    }
                    alt='Card cap'
                  />
                </a>
              )}
          </div>
        ))}
      <span
        className='mt-3'
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          <i
            className='fa fa-heart mr-1'
            aria-hidden='true'
            style={{ color: "red" }}
          ></i>
          {item.likes}
        </span>
        <span></span>
        <button
          className='mt-2 mr-2 btn btn-danger'
          data-toggle='modal'
          data-target='#deletePostModal'
          onClick={(e) => setDeletePostId(item.id)}
        >
          Delete Post
        </button>
        {item.posted}
      </span>
    </div>
  );
};

export default React.memo(Post);
