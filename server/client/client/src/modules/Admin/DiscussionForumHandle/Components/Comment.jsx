import React from "react";
import urlCheck from "../../../../utils/urlCheck";

const Comment = ({ item, styles, onClickItem, setDeleteCommentId }) => {
  // console.log(item);
  let comment = JSON.parse(item?.comment);
  // console.log(question);
  return (
    <div className='card' style={styles.commentContainer} key={item?.id}>
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
          className='fa fa-times btn btn-danger '
          data-toggle='modal'
          data-target='#deleteCommentModal'
          onClick={() => {
            setDeleteCommentId(item.id);
          }}
        ></button>
      </div>

      {comment &&
        comment.map((que, index) => (
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
                  style={{
                    minHeight: "50px",
                    backgroundColor: "black",
                    border: "0.1px solid #0000003b 0px 2px 6px",
                  }}
                  href={
                    urlCheck(que.attributes.embed.source)
                      ? que.attributes.embed.source
                      : `${process.env.REACT_APP_NODE_URL_COMMENT}/${que.attributes.embed.source}`
                  }
                >
                  <img
                    style={{
                      maxWidth: "250px",
                      // maxHeight: "250px",
                      height: "auto",
                      backgroundColor: "black",
                      minHeight: "150px",
                    }}
                    loading='lazy'
                    className='card-img-top'
                    src={
                      urlCheck(que.attributes.embed.source)
                        ? que.attributes.embed.source
                        : `${process.env.REACT_APP_NODE_URL_COMMENT}/${que.attributes.embed.source}`
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

        {item.posted}
      </span>
    </div>
  );
};

export default React.memo(Comment);
