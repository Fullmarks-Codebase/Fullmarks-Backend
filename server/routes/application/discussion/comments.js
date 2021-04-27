const fs = require("fs");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const router = require("express").Router();
const auth = require("../../../auth/adminAuth");
const modifyImageName = require("../../../utils/modifyImageName");
const {
  singleImageAdd,
  singleImageDelete,
  singleImageUpdate,
} = require("../../../utils/ImageUtils");
const CommentHistory = db.commentHistory;
const CommentLikeHistory = db.commentLikeHistory;
const User = db.users;

router.post("/", auth, (req, res) => {
  try {
    if (req.body.postId) {
      if (!parseInt(req.body.postId))
        return res.status(400).send(errorResponse(500, "Need postId"));
    } else {
      return res.status(400).send(errorResponse(500, "Need postId"));
    }
    let where = {};
    let limit = 10;
    let skip = null;

    if (req.body.page) {
      if (req.body.page < 1 || !parseInt(req.body.page))
        return res.status(500).send(errorResponse(500, "need valid page"));
      const pageSize = 10;
      limit = 10;
      skip = (req.body.page - 1) * pageSize;
    }

    where["postId"] = req.body.postId;

    CommentHistory.findAll({
      where: where,
      include: [
        {
          model: User,
          attributes: ["id", "username", "userProfileImage", "thumbnail"],
          as: "user",
          required: false,
          group: ["id"],
        },
        {
          attributes: [],
          model: CommentLikeHistory,
          as: "like",
          required: false,
          where: {
            userId: req.user.id,
          },
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.fn(
              "date_format",
              db.sequelize.fn(
                "convert_tz",
                db.sequelize.col("discussion_comment_histories.createdAt"),
                "+00:00",
                "+05:30"
              ),
              "%D %b %Y"
            ),
            "posted",
          ],
          [db.sequelize.literal(" IF(count(like.userId) > 0, 1, 0)"), "liked"],
        ],
      },
      offset: skip,
      limit: limit,
      order: [["id", "DESC"]],
      subQuery: false,
      group: ["id"],
    })
      .then((result) => {
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    if (
      (Object.keys(req.body).length === 0 && req.body.constructor === Object) ||
      !parseInt(req.body.postId) ||
      !req.body.comment
    ) {
      return res.status(400).send(errorResponse(400, "need postId, comment"));
    }

    const post = await db.posts.findOne({ where: { id: req.body.postId } });
    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }

    const commentContent = JSON.parse(req.body.comment);

    let names = [];
    if (req.files) {
      if (Object.keys(req.files).length > 0) {
        var imageKeyNames = Object.keys(req.files);
        imageKeyNames.map((i) => {
          const image = req.files[i];
          commentContent.map((tag, indexT) => {
            if (
              tag.attributes &&
              tag.attributes.embed &&
              tag.attributes.embed.source &&
              tag.attributes.embed.type === "image" &&
              tag.attributes.embed.source.split("/").pop() === image.name
            ) {
              const result = singleImageAdd(image, "comment", req);
              if (result.status === 0) {
                reject(errorResponse(500, result.err));
              }
              // if (process.env.NODE_ENV === "production") {
              //   tag.attributes.embed.source = `${process.env.AWS_IMAGE_POST}/${result.name}`;
              // } else {
              tag.attributes.embed.source = `${result.name}`;
              // }
              names.push(`${result.name}`);
            }
          });
        });
      }
    }

    // let names = [];
    // if (req.files) {
    //   if (req.files.images) {
    //     if (!Array.isArray(req.files.images)) {
    //       commentContent.map((tag) => {
    //         if (
    //           tag.attributes &&
    //           tag.attributes.embed &&
    //           tag.attributes.embed.source &&
    //           tag.attributes.embed.type === "image" &&
    //           tag.attributes.embed.source.split("/").pop() ===
    //             req.files.images.name
    //         ) {
    //           const result = singleImageAdd(req.files.images, "comment", req);
    //           if (result.status === 0) {
    //             reject(errorResponse(500, result.err));
    //           }
    //           tag.attributes.embed.source = `${result.name}`;
    //           names.push(`${result.name}`);
    //         }
    //       });
    //     } else if (req.files.images) {
    //       req.files.images.map((image, index) => {
    //         commentContent.map((tag, indexT) => {
    //           if (
    //             tag.attributes &&
    //             tag.attributes.embed &&
    //             tag.attributes.embed.source &&
    //             tag.attributes.embed.type === "image" &&
    //             tag.attributes.embed.source.split("/").pop() === image.name
    //           ) {
    //             const result = singleImageAdd(image, "comment", req);
    //             if (result.status === 0) {
    //               reject(errorResponse(500, result.err));
    //             }
    //             tag.attributes.embed.source = `${result.name}`;
    //             names.push(`${result.name}`);
    //           }
    //         });
    //       });
    //     }
    //   }
    // }

    CommentHistory.create({
      ...req.body,
      comment: JSON.stringify(commentContent),
      userId: req.user.id,
    })
      .then(async (result) => {
        if (post.comments > -1) {
          post.comments += 1;
          await post.save();
        }
        let objects = [];
        names.map((i) => {
          objects.push({
            commentId: result.id,
            image_name: i,
            postId: req.body.postId,
          });
        });
        await db.commentImages.bulkCreate(objects);
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

async function deleteOldImage(id, name) {
  return new Promise(async (resolve, reject) => {
    try {
      await db.commentImages.destroy({
        where: {
          commentId: id,
          image_name: name,
        },
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

router.put("/update", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.commentId)) {
      return res.status(400).send(errorResponse(400, "need commentId"));
    }
    const comment = await CommentHistory.findOne({
      where: { id: req.body.commentId },
    });

    if (!comment) {
      return res.status(400).send(errorResponse(400, "comment doesn't exist"));
    }

    let promise = [];
    //delete images
    if (req.body.deleteImages) {
      const imageNames = req.body.deleteImages
        .replace(new RegExp('"', "g"), "")
        .replace("[", "")
        .replace("]", "")
        .split(",");
      imageNames.map((image) => {
        singleImageDelete("comment", req, image);
        promise.push(deleteOldImage(req.body.commentId, image));
      });
    }

    // add new image if exist
    const commentContent = JSON.parse(req.body.comment);
    // let names = [];
    // if (req.files) {
    //   if (!Array.isArray(req.files.images)) {
    //     commentContent.map((tag) => {
    //       if (
    //         tag.attributes &&
    //         tag.attributes.embed &&
    //         tag.attributes.embed.source &&
    //         tag.attributes.embed.type === "image" &&
    //         tag.attributes.embed.source.split("/").pop() ===
    //           req.files.images.name
    //       ) {
    //         const result = singleImageAdd(req.files.images, "comment", req);
    //         if (result.status === 0) {
    //           reject(errorResponse(500, result.err));
    //         }
    //         tag.attributes.embed.source = `${result.name}`;
    //         names.push(`${result.name}`);
    //       }
    //     });
    //   } else if (req.files.images) {
    //     req.files.images.map((image, index) => {
    //       commentContent.map((tag, indexT) => {
    //         if (
    //           tag.attributes &&
    //           tag.attributes.embed &&
    //           tag.attributes.embed.source &&
    //           tag.attributes.embed.type === "image" &&
    //           tag.attributes.embed.source.split("/").pop() === image.name
    //         ) {
    //           const result = singleImageAdd(image, "post", req);
    //           if (result.status === 0) {
    //             reject(errorResponse(500, result.err));
    //           }
    //           tag.attributes.embed.source = `${result.name}`;
    //           names.push(`${result.name}`);
    //         }
    //       });
    //     });
    //   }
    // }
    let names = [];
    if (req.files) {
      if (Object.keys(req.files).length > 0) {
        var imageKeyNames = Object.keys(req.files);
        imageKeyNames.map((i) => {
          const image = req.files[i];
          commentContent.map((tag, indexT) => {
            if (
              tag.attributes &&
              tag.attributes.embed &&
              tag.attributes.embed.source &&
              tag.attributes.embed.type === "image" &&
              tag.attributes.embed.source.split("/").pop() === image.name
            ) {
              const result = singleImageAdd(image, "comment", req);
              if (result.status === 0) {
                reject(errorResponse(500, result.err));
              }
              // if (process.env.NODE_ENV === "production") {
              //   tag.attributes.embed.source = `${process.env.AWS_IMAGE_POST}/${result.name}`;
              // } else {
              tag.attributes.embed.source = `${result.name}`;
              // }
              names.push(`${result.name}`);
            }
          });
        });
      }
    }

    Promise.all(promise)
      .then(() => {
        CommentHistory.update(
          { ...req.body, comment: JSON.stringify(commentContent) },
          { where: { id: req.body.commentId } }
        )
          .then(async (result) => {
            let objects = [];
            names.map((i) => {
              objects.push({ commentId: req.body.commentId, image_name: i });
            });
            await db.commentImages.bulkCreate(objects);
            return res
              .status(200)
              .send(successResponse("Comment Updated", 200));
          })
          .catch((err) => {
            return res.status(500).send(errorResponse(500, err.toString()));
          });
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    console.log(req.params.id);
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(400, "need commentId"));
    }

    const comment = await CommentHistory.findOne({
      where: { id: req.params.id },
    });
    if (!comment) {
      return res.status(400).send(errorResponse(400, "Comment not found"));
    }

    const comment_images = await db.commentImages.findAll({
      where: {
        commentId: req.params.id,
      },
    });

    comment_images.map(async (i) => {
      singleImageDelete("comment", req, i.image_name);
    });

    const post = await db.posts.findOne({ where: { id: comment.postId } });
    if (post.comments > 0) {
      post.comments -= 1;
      await post.save();
    }

    CommentHistory.destroy({ where: { id: req.params.id } })
      .then(async (result) => {
        return res.status(200).send(successResponse("Comment Deleted", 200));
      })
      .catch((err) => {
        return res.status(400).send(errorResponse(400, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/like", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.commentId)) {
      return res.status(400).send(errorResponse(400, "need postId, commentId"));
    }

    const like = await CommentLikeHistory.findOne({
      where: {
        commentId: req.body.commentId,
        userId: req.user.id,
      },
    });

    if (like) {
      return res.status(400).send(errorResponse(400, "Already Liked"));
    }

    CommentLikeHistory.create({ ...req.body, userId: req.user.id })
      .then(async (result) => {
        const comment = await CommentHistory.findOne({
          where: { id: req.body.commentId },
        });
        if (comment.likes > -1) comment.likes = comment.likes + 1;
        await comment.save();
        return res.status(200).send(successResponse("liked", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/dislike", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.commentId)) {
      return res.status(400).send(errorResponse(400, "need commentId"));
    }
    const like = await CommentLikeHistory.findOne({
      where: {
        commentId: req.body.commentId,
        userId: req.user.id,
      },
    });

    if (like) {
      CommentLikeHistory.destroy({ where: { id: like.id } })
        .then(async () => {
          const comment = await CommentHistory.findOne({
            where: { id: req.body.commentId },
          });
          if (comment.likes > 0) comment.likes = comment.likes - 1;
          await comment.save();
        })
        .then(() => {
          return res.status(200).send(successResponse("disliked", 200));
        });
    } else {
      return res.status(400).send(errorResponse(400, "already disliked"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/deleteImage", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.commentId)) {
      return res.status(400).send(errorResponse(400, "Need comment Id"));
    }
    const comment = await CommentHistory.findOne({
      where: { id: req.body.commentId },
    });
    if (!comment) {
      return res.status(400).send(errorResponse(400, "Comment doesn't exist"));
    }
    const oldImage = `${process.env.comment_image}/${comment.comment_image}`;
    if (comment.question_image && fs.existsSync(oldImage))
      fs.unlinkSync(oldImage);
    comment.question_image = null;
    await comment.save();
    return res.status(200).send(successResponse("Image Deleted", 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
