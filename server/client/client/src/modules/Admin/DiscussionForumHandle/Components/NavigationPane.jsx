import React, { Suspense } from "react";
import Comment from "./Comment";
import Loader from "./Loader";
const Post = React.lazy(() => import("./Post"));
const NavigationPane = ({
  selectorContainerStyle,
  title,
  data,
  selectedId,
  onClickItem,
  post,
  comment,
  subjectsLoading,
  loading,
  setDeleteCommentId,
  setDeletePostId,
}) => {
  return (
    <div
      style={{
        ...selectorContainerStyle,
        padding: "8px",
        margin: "0px 2px",
        backgroundColor: "white",
        overflow: "scroll",
        maxHeight: "77.2vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {title && (
        <h6 style={{ paddingTop: "15px", paddingLeft: "10px" }}>{title}</h6>
      )}
      <div className='dropdown-divider'></div>
      <ul
        className='list-group'
        style={{ ...styles.listGroup, ...(!post && !comment ? {} : {}) }}
      >
        {data && data?.length <= 0 ? (
          <h5>Nothing to show...</h5>
        ) : (
          data.map((item) =>
            post ? (
              loading ? (
                <Loader key={item.id} />
              ) : (
                <Suspense key={item.id} fallback={<Loader />}>
                  <Post
                    key={item?.id}
                    item={item}
                    styles={styles}
                    onClickItem={onClickItem}
                    selectedId={selectedId}
                    setDeletePostId={setDeletePostId}
                  />
                </Suspense>
              )
            ) : comment ? (
              loading ? (
                <Loader key={item?.id} />
              ) : (
                <Comment
                  item={item}
                  styles={styles}
                  key={item.id}
                  setDeleteCommentId={setDeleteCommentId}
                />
              )
            ) : subjectsLoading ? (
              <div
                className='spinner-grow text-info'
                role='status'
                key={item?.id}
              >
                <span className='sr-only'>Loading...</span>
              </div>
            ) : (
              <li
                key={item?.id}
                value={item.id}
                onClick={onClickItem}
                style={{
                  ...(selectedId === item.id ? styles.selected : {}),
                  ...styles.listItem,
                }}
                className={
                  "p-3 mb-1 list-group-item text-left btn btn-light " +
                  (selectedId === item.id ? "active" : "")
                }
              >
                {item.name}
              </li>
            )
          )
        )}
      </ul>
    </div>
  );
};

const styles = {
  listGroup: { minWidth: "100px", width: "100%" },
  listItem: {},
  selected: {
    backgroundColor: "#7ac3ff",
  },
  postContainer: {
    flexGrow: "3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "whitesmoke",
    padding: "10px",
    margin: "10px",
    marginBottom: "6px",
    boxShadow: "0px 2px 6px grey",
    minWidth: "min-content",
    // width: "150%",
    // minWidth: "20px",
  },
  commentContainer: {
    flexGrow: "3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "whitesmoke",
    padding: "10px",
    margin: "10px",
    marginBottom: "6px",
    boxShadow: "0px 2px 6px grey",
    minWidth: "min-content",
    // width: "150%",
    // minWidth: "20px",
  },
  avatar: {
    height: "40px",
    width: "40px",
    borderRadius: "100%",
    marginRight: "10px",
  },
};

export default React.memo(NavigationPane);
