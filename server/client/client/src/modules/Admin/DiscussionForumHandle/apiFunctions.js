import { axiosForAdmin } from "../../../axiosconfig";
import { toast } from "react-toastify";

// Fetch All
export const fetchAllClasses = (setState) => {
  // Complete logic
  axiosForAdmin
    .post("/class")
    .then((response) => {
      setState(response.data.result);
    })
    .catch((error) => console.log(error));
};

export const fetchAllSubjects = (setState) => {
  // Complete logic
};

export const fetchAllPosts = (setState) => {
  // Complete logic
};

export const fetchAllComments = (setState) => {
  // Complete logic
};

// Fetch Filtered

export const fetchSubjects = (setState, classId, setSubjectsLoading) => {
  // Complete logic
  setSubjectsLoading(true);
  axiosForAdmin
    .post("/subjects/byClassId", { classId })
    .then((response) => {
      setState(response.data.result);
      setSubjectsLoading(false);
    })
    .catch((error) => {
      console.log(error);

      setSubjectsLoading(false);
    });
};

export const fetchPostsBySubjectId = (setState, subjectId, setPostLoading) => {
  // Complete logic
  setPostLoading(true);
  axiosForAdmin
    .post("/posts", { subjectId })
    .then((response) => {
      setState(response.data.result);
      setPostLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setPostLoading(false);
    });
};

export const fetchPostsByUserId = (setState, userId) => {
  // Complete logic
};

export const fetchCommentsByPostId = (setState, postId, setCommentsLoading) => {
  setCommentsLoading(true);
  axiosForAdmin
    .post("/posts/comments", { postId })
    .then((response) => {
      // console.log(response);
      setState(response.data.result);
      setCommentsLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setCommentsLoading(false);
    });
};

export const fetchCommentsBySubjectId = (setState, subjectId) => {
  // Complete logic
};

export const fetchCommentsByUserId = (userId) => {
  // Complete logic
};

export const deletePost = (postId, callback) => {
  axiosForAdmin
    .delete(`/posts/admin/delete/${postId}`)
    .then((response) => {
      // console.log(response);
      toast.success("Post deleted successfully.");
      callback();
    })
    .catch((error) => {
      toast.error("Error: Post could not be deleted. Check log");
      console.log(error);
    });
};

// Delete Methods

export const deleteComment = (commentId, callback) => {
  axiosForAdmin
    .delete(`/posts/comments/delete/${commentId}`)
    .then((response) => {
      toast.success("Comment Deleted");
      callback();
    })
    .catch((error) => {
      console.log(error);
      toast.error("Error Deleting Comment : Check Log");
    });
};
