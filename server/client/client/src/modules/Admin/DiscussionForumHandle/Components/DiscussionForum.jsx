import React, { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteComment,
  deletePost,
  fetchAllClasses,
  fetchCommentsByPostId,
  fetchPostsBySubjectId,
  fetchSubjects,
} from "../apiFunctions";
import $ from "jquery";

import Loading from "../../../Loading/Loading";
import DeleteCommentModal from "./DeleteCommentModal";
import DeletePostModal from "./DeletePostModal";
const NavigationPane = React.lazy(() => import("./NavigationPane"));

const DiscussionForum = () => {
  const [allClasses, setAllClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [postLoading, setPostLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(-1);
  const [deletePostId, setDeletePostId] = useState(-1);
  const [selectedData, setSelectedData] = useState({
    classId: -1,
    subjectId: -1,
    postId: -1,
    commentId: -1,
  });

  useEffect(() => {
    fetchAllClasses(setAllClasses);
  }, []);

  const changeClass = (e) => {
    let classId = parseInt(e.target.value);
    setSelectedData({ ...selectedData, classId });

    fetchSubjects(setSubjects, classId, setSubjectsLoading);
  };

  const changeSubject = (e) => {
    let subjectId = parseInt(e.target.value);
    setSelectedData({ ...selectedData, subjectId });

    fetchPostsBySubjectId(setPosts, subjectId, setPostLoading);
  };

  const showComments = (id) => {
    let postId = parseInt(id);
    setSelectedData({ ...selectedData, postId });

    fetchCommentsByPostId(setComments, postId, setCommentsLoading);
  };

  const handleDeleteComment = () => {
    // toast.info("Wooooww I am a toast");
    deleteComment(deleteCommentId, () =>
      fetchCommentsByPostId(
        setComments,
        selectedData.postId,
        setCommentsLoading
      )
    );
    $("#deleteCommentModal").modal("hide");
  };
  const handleDeletePost = () => {
    deletePost(deletePostId, () =>
      fetchPostsBySubjectId(setPosts, selectedData.subjectId, setPostLoading)
    );
    $("#deletePostModal").modal("hide");
  };
  return (
    <>
      <div className='main-content fix' style={{ maxHeight: "100vh" }}>
        <section className='section'>
          <Header />
          <div style={styles.selectorContainer}>
            <Suspense fallback={<Loading />}>
              <NavigationPane
                title='Classes'
                data={allClasses}
                selectedId={selectedData.classId}
                onClickItem={changeClass}
                selectorContainerStyle={styles.classesContainer}
              />
            </Suspense>
            {selectedData.classId !== -1 && (
              <NavigationPane
                title='Subjects'
                data={subjects}
                selectorContainerStyle={styles.SubjectsContainer}
                selectedId={selectedData.subjectId}
                onClickItem={changeSubject}
                subjectsLoading={subjectsLoading}
              />
            )}
            {selectedData.subjectId !== -1 && (
              <NavigationPane
                title='Posts'
                data={posts}
                selectorContainerStyle={styles.postsContainer}
                selectedId={selectedData.postId}
                onClickItem={showComments}
                post
                loading={postLoading}
                setDeletePostId={setDeletePostId}
              />
            )}
            {selectedData.postId !== -1 && (
              <NavigationPane
                title='Comments'
                data={comments}
                selectorContainerStyle={styles.commentsContainer}
                selectedId={5}
                loading={commentsLoading}
                comment
                setDeleteCommentId={setDeleteCommentId}
              />
            )}
          </div>
        </section>
      </div>
      <DeleteCommentModal handleDeleteComment={handleDeleteComment} />
      <DeletePostModal handleDeletePost={handleDeletePost} />
    </>
  );
};

const Header = () => {
  return (
    <div className='section-header'>
      <h1>Discussion Forum</h1>
      <div className='section-header-breadcrumb'>
        <div className='breadcrumb-item active'>
          <Link to='/dashboard'>Dashboard</Link>
        </div>
        <div className='breadcrumb-item'>Discussion Forum</div>
      </div>
    </div>
  );
};

const styles = {
  selectorContainer: {
    display: "flex",
    maxHeight: "77.2vh",
    flexWrap: "wrap",
  },
  classesContainer: {
    flexGrow: 1,
    minWidth: "max-content",
    maxWidth: "max-content",
  },
  SubjectsContainer: {
    flexGrow: 1,
    minWidth: "max-content",
    maxWidth: "max-content",
  },
  postsContainer: { flexGrow: 2 },
  commentsContainer: { flexGrow: 2 },
};

export default React.memo(DiscussionForum);
