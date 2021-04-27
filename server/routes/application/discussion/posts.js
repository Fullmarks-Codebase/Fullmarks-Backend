const fs = require("fs");
const db = require("../../../db");
const errorResponse = require("../../../utils/errorResponse");
const successResponse = require("../../../utils/successResponse");
const { Op } = require("sequelize");
const router = require("express").Router();
const auth = require("../../../auth/adminAuth");
const modifyImageName = require("../../../utils/modifyImageName");
const imageCheck = require("../../../utils/imageCheck");
const {
  singleImageAdd,
  singleImageDelete,
  singleImageUpdate,
} = require("./../../../utils/ImageUtils");
const Post = db.posts;
const User = db.users;
const LikeHistory = db.likeHistory;
const SaveHistory = db.savedHistory;
const sequelize = db.sequelize;

router.post("/", auth, async (req, res) => {
  try {
    let where = {};
    let limit = null;
    let skip = null;

    if (req.body.postId) {
      if (!parseInt(req.body.postId)) {
        return res.status(400).send(errorResponse(400, "Need PostId"));
      }
      where["id"] = parseInt(req.body.postId);
    }

    if (req.body.subjectId) {
      if (!parseInt(req.body.subjectId)) {
        return res.status(400).send(errorResponse(400, "Need SubjectId"));
      }
      where["subjectId"] = parseInt(req.body.subjectId);
    } else {
      // const classId = await db.class.findOne({
      //   where: {
      //     id: req.user.class,
      //   },
      // });
      const subjectIds = await db.subjects.findAll({
        where: {
          classId: parseInt(req.user.class),
        },
      });

      let ids = subjectIds.map((i) => {
        return i.id;
      });
      where["subjectId"] = {
        [Op.in]: ids,
      };
    }

    if (req.body.page) {
      if (req.body.page < 1 || !parseInt(req.body.page))
        return res.status(500).send(errorResponse(500, "Need valid page"));
      const pageSize = 10;
      limit = 10;
      skip = (req.body.page - 1) * pageSize;
    }

    // if(g.user_idx IS NOT NULL,'true','false')
    Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "userProfileImage", "thumbnail"],
          as: "user",
          required: false,
        },
        {
          attributes: ["name", "image"],
          model: db.subjects,
          as: "subject",
          required: false,
        },
        {
          where: {
            userId: req.user.id,
          },
          model: LikeHistory,
          attributes: [],
          as: "like",
          required: false,
        },
        {
          where: {
            userId: req.user.id,
          },
          model: SaveHistory,
          as: "saved",
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.fn(
              "date_format",
              db.sequelize.fn(
                "convert_tz",
                db.sequelize.col("posts.createdAt"),
                "+00:00",
                "+05:30"
              ),
              "%D %b %Y"
            ),
            "posted",
          ],
          [db.sequelize.literal(" IF(count(like.userId) > 0, 1, 0)"), "liked"],
          [db.sequelize.literal(" IF(count(saved.userId) > 0, 1, 0)"), "save"],
        ],
      },
      where: where,
      offset: skip,
      limit: limit,
      order: [["id", "DESC"]],
      group: ["id"],
      subQuery: false,
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
      !req.body.question ||
      !parseInt(req.body.subjectId)
    ) {
      return res
        .status(400)
        .send(errorResponse(400, "Need Question, and SubjectId"));
    }

    const subjectId = await db.subjects.findOne({
      where: { id: req.body.subjectId },
    });
    if (!subjectId) {
      return res.status(400).send(errorResponse(400, "Subject Doesnt Exist"));
    }

    const questioncontent = JSON.parse(req.body.question);

    let names = [];
    if (req.files) {
      if (Object.keys(req.files).length > 0) {
        var imageKeyNames = Object.keys(req.files);
        imageKeyNames.map((i) => {
          const image = req.files[i];
          questioncontent.map((tag, indexT) => {
            if (
              tag.attributes &&
              tag.attributes.embed &&
              tag.attributes.embed.source &&
              tag.attributes.embed.type === "image" &&
              tag.attributes.embed.source.split("/").pop() === image.name
            ) {
              const result = singleImageAdd(image, "post", req);
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

    // if (req.files) {
    //   if (!Array.isArray(req.files.images)) {
    //     questioncontent.map((tag) => {
    //       if (
    //         tag.attributes &&
    //         tag.attributes.embed &&
    //         tag.attributes.embed.source &&
    //         tag.attributes.embed.type === "image" &&
    //         tag.attributes.embed.source.split("/").pop() ===
    //           req.files.images.name
    //       ) {
    //         const result = singleImageAdd(req.files.images, "post", req);
    //         if (result.status === 0) {
    //           reject(errorResponse(500, result.err));
    //         }
    //         tag.attributes.embed.source = `${result.name}`;
    //         names.push(`${result.name}`);
    //       }
    //     });
    //   } else if (req.files.images) {
    //     req.files.images.map((image, index) => {
    //       questioncontent.map((tag, indexT) => {
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
    //           // if (process.env.NODE_ENV === "production") {
    //           //   tag.attributes.embed.source = `${process.env.AWS_IMAGE_POST}/${result.name}`;
    //           // } else {
    //           tag.attributes.embed.source = `${result.name}`;
    //           // }
    //           names.push(`${result.name}`);
    //         }
    //       });
    //     });
    //   }
    // }

    Post.create({
      ...req.body,
      question: JSON.stringify(questioncontent),
      userId: req.user.id,
    })
      .then(async (result) => {
        let objects = [];
        names.map((i) => {
          objects.push({ postId: result.id, image_name: i });
        });
        await db.postImages.bulkCreate(objects);
        return res.status(200).send(successResponse("Success", 200, result));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    console.log(error);
    res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    if (!parseInt(req.params.id)) {
      return res.status(400).send(errorResponse(400, "need Post Id"));
    }
    const post = await Post.findOne({ where: { id: req.params.id } });

    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }

    if (post.userId !== req.user.id) {
      return res
        .status(400)
        .send(errorResponse(400, "You cannot delete post of others"));
    }

    const post_images = await db.postImages.findAll({
      where: {
        postId: req.params.id,
      },
    });

    const comment_images = await db.commentImages.findAll({
      where: {
        postId: req.params.id,
      },
    });

    post_images.map(async (i) => {
      singleImageDelete("post", req, i.image_name);
    });

    comment_images.map(async (i) => {
      singleImageDelete("comment", req, i.image_name);
    });

    await db.postImages.destroy({ where: { postId: req.params.id } });
    await db.commentImages.destroy({ where: { postId: req.params.id } });

    Post.destroy({ where: { id: req.params.id } })
      .then(async (result) => {
        return res.status(200).send(successResponse("Post Deleted", 200));
      })
      .catch((err) => {
        return res.status(400).send(errorResponse(400, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

async function deleteOldImage(id, name) {
  return new Promise(async (resolve, reject) => {
    try {
      await db.postImages.destroy({
        where: {
          postId: id,
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
    if (!parseInt(req.body.postId)) {
      return res.status(400).send(errorResponse(400, "need PostId"));
    }
    const post = await Post.findOne({ where: { id: req.body.postId } });

    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }

    if (post.userId !== req.user.id) {
      return res
        .status(400)
        .send(errorResponse(400, "You cannot update post of others"));
    }
    let subjectChange = {};
    if (parseInt(req.body.subjectId)) {
      subjectChange["subjectId"] = parseInt(req.body.subjectId);
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
        singleImageDelete("post", req, image);
        promise.push(deleteOldImage(req.body.postId, image));
      });
    }

    // add new image if exist
    const questioncontent = JSON.parse(req.body.question);
    let names = [];
    if (req.files) {
      if (Object.keys(req.files).length > 0) {
        var imageKeyNames = Object.keys(req.files);
        imageKeyNames.map((i) => {
          const image = req.files[i];
          questioncontent.map((tag, indexT) => {
            if (
              tag.attributes &&
              tag.attributes.embed &&
              tag.attributes.embed.source &&
              tag.attributes.embed.type === "image" &&
              tag.attributes.embed.source.split("/").pop() === image.name
            ) {
              const result = singleImageAdd(image, "post", req);
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
        Post.update(
          {
            question: JSON.stringify(questioncontent),
            subjectId: req.body.subjectId || post.subjectId,
          },
          { where: { id: req.body.postId } }
        )
          .then(async (result) => {
            let objects = [];
            names.map((i) => {
              objects.push({ postId: req.body.postId, image_name: i });
            });
            await db.postImages.bulkCreate(objects);
            const post = await Post.findOne({ where: { id: req.body.postId } });
            return res
              .status(200)
              .send(successResponse("Post Updated", 200, post));
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).send(errorResponse(500, err.toString()));
          });
      })
      .catch((err) => {
        console.log(err);

        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/like", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.postId)) {
      return res.status(400).send(errorResponse(400, "need postId and userId"));
    }
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }

    const result = await sequelize
      .transaction(async (t) => {
        const like = await LikeHistory.findOne({
          where: {
            postId: req.body.postId,
            userId: req.user.id,
          },
        });

        if (like) {
          return res.status(400).send(errorResponse(400, "Already Liked"));
        }

        LikeHistory.create({ userId: req.user.id, postId: req.body.postId })
          .then(async (resp) => {
            const post = await Post.findOne({ where: { id: req.body.postId } });
            if (post.likes > -1) post.likes = post.likes + 1;
            await post.save();
            return res.status(200).send(successResponse("Liked", 200));
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

router.post("/dislike", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.postId)) {
      return res.status(400).send(errorResponse(400, "need postId and userId"));
    }
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }
    const like = await LikeHistory.findOne({
      where: {
        postId: req.body.postId,
        userId: req.user.id,
      },
    });
    if (like) {
      LikeHistory.destroy({ where: { id: like.id } })
        .then(async () => {
          const post = await Post.findOne({ where: { id: req.body.postId } });
          if (post.likes > 0) post.likes = post.likes - 1;
          await post.save();
        })
        .then(() => {
          return res.status(200).send(successResponse("Disliked", 200));
        });
    } else {
      return res.status(400).send(errorResponse(400, "Already Disliked"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/mySaved", auth, async (req, res) => {
  try {
    let limit = null;
    let skip = null;
    let where = {};

    if (req.body.subjectId) {
      if (!parseInt(req.body.subjectId)) {
        return res.status(500).send(errorResponse(500, "need valid subject"));
      }
      where["subjectId"] = req.body.subjectId;
    }

    if (req.body.page) {
      if (!parseInt(req.body.page) || req.body.page < 1)
        return res.status(500).send(errorResponse(500, "need valid page"));
      const pageSize = 10;
      limit = 10;
      skip = (req.body.page - 1) * pageSize;
    }

    // const mySaves = await
    // SaveHistory.findAll({
    //   where: {
    //     userId: req.user.id,
    //   },
    //   attributes: ["id"],
    //   group: ["id"],
    //   include: [
    //     {
    //       where: where,
    //       model: db.posts,
    //       as: "post",
    //       include: [
    //         {
    //           model: User,
    //           attributes: ["id", "username", "userProfileImage"],
    //           as: "user",
    //           required: false,
    //         },
    //         {
    //           where: {
    //             userId: req.user.id,
    //           },
    //           attributes: ["userId"],
    //           model: LikeHistory,
    //           as: "like",
    //           required: false,
    //         },
    //         {
    //           where: {
    //             userId: req.user.id,
    //           },
    //           attributes: ["userId"],
    //           model: SaveHistory,
    //           as: "saved",
    //           required: false,
    //         },
    //       ],
    //       attributes: {
    //         include: [
    //           [
    //             db.sequelize.fn(
    //               "date_format",
    //               db.sequelize.col("post.createdAt"),
    //               "%D %b %Y"
    //             ),
    //             "posted",
    //           ],
    //         ],
    //       },
    //     },
    //   ],
    //   offset: skip,
    //   limit: limit,
    // })
    Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "userProfileImage", "thumbnail"],
          as: "user",
          required: false,
        },
        {
          attributes: ["name", "image"],
          model: db.subjects,
          as: "subject",
          required: false,
        },
        {
          where: {
            userId: req.user.id,
          },
          attributes: [],
          model: LikeHistory,
          as: "like",
          required: false,
        },
        {
          where: {
            userId: req.user.id,
          },
          attributes: [],
          model: SaveHistory,
          as: "saved",
          required: true,
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.fn(
              "date_format",
              db.sequelize.fn(
                "convert_tz",
                db.sequelize.col("posts.createdAt"),
                "+00:00",
                "+05:30"
              ),
              "%D %b %Y"
            ),
            "posted",
          ],
          [db.sequelize.literal(" IF(count(like.userId) > 0, 1, 0)"), "liked"],
          [db.sequelize.literal(" IF(count(saved.userId) > 0, 1, 0)"), "save"],
        ],
      },
      where: where,
      order: [["id", "DESC"]],
      group: ["id"],
      offset: skip,
      limit: limit,
      subQuery: false,
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

router.post("/save", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.postId)) {
      return res.status(400).send(errorResponse(400, "need postId"));
    }
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }
    const check = await SaveHistory.findOne({
      where: {
        postId: req.body.postId,
        userId: req.user.id,
      },
    });
    if (check) {
      return res.status(400).send(errorResponse(400, "Already Saved"));
    }
    SaveHistory.create({ ...req.body, userId: req.user.id })
      .then(() => {
        return res.status(200).send(successResponse("Saved", 200));
      })
      .catch((err) => {
        return res.status(500).send(errorResponse(500, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/removeSave", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.postId)) {
      return res.status(400).send(errorResponse(400, "need postId"));
    }
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }
    const check = await SaveHistory.findOne({
      where: {
        postId: req.body.postId,
        userId: req.user.id,
      },
    });
    if (!check) {
      return res.status(400).send(errorResponse(400, "Saved Doesnt exist"));
    }
    SaveHistory.destroy({ where: { id: check.id } })
      .then(() => {
        return res.status(200).send(successResponse("removed", 200));
      })
      .catch((err) => {
        return res.status(400).send(errorResponse(400, err.toString()));
      });
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

router.post("/myPost", auth, (req, res) => {
  try {
    let where = { userId: req.user.id };
    let limit = 10;
    let skip = null;

    if (req.body.page) {
      if (req.body.page < 1 || !parseInt(req.body.page))
        return res.status(500).send(errorResponse(500, "Need valid page"));
      const pageSize = 10;
      limit = 10;
      skip = (req.body.page - 1) * pageSize;
    }

    if (req.body.subjectId) {
      if (!parseInt(req.body.subjectId)) {
        return res
          .status(400)
          .send(errorResponse(400, "Need Proper Subject Id"));
      }
      where["subjectId"] = req.body.subjectId;
    }

    Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "userProfileImage", "thumbnail"],
          as: "user",
          required: false,
        },
        {
          where: {
            userId: req.user.id,
          },
          attributes: [],
          model: LikeHistory,
          as: "like",
          required: false,
        },
        {
          where: {
            userId: req.user.id,
          },
          attributes: [],
          model: SaveHistory,
          as: "saved",
          required: false,
        },
        {
          attributes: ["name", "image"],
          model: db.subjects,
          as: "subject",
          required: false,
        },
      ],
      attributes: {
        include: [
          [
            db.sequelize.fn(
              "date_format",
              db.sequelize.fn(
                "convert_tz",
                db.sequelize.col("posts.createdAt"),
                "+00:00",
                "+05:30"
              ),
              "%D %b %Y"
            ),
            "posted",
          ],
          [db.sequelize.literal(" IF(count(like.userId) > 0, 1, 0)"), "liked"],
          [db.sequelize.literal(" IF(count(saved.userId) > 0, 1, 0)"), "save"],
        ],
      },
      where: where,
      offset: skip,
      limit: limit,
      order: [["id", "DESC"]],
      group: ["id"],
      subQuery: false,
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

router.post("/deleteImage", auth, async (req, res) => {
  try {
    if (!parseInt(req.body.postId)) {
      return res.status(400).send(errorResponse(400, "Need Post Id"));
    }
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post) {
      return res.status(400).send(errorResponse(400, "Post doesn't exist"));
    }
    const oldImage = `${process.env.post_image}/${post.question_image}`;
    if (post.question_image && fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
    post.question_image = null;
    await post.save();
    return res.status(200).send(successResponse("Image Deleted", 200));
  } catch (error) {
    return res.status(500).send(errorResponse(500, error.toString()));
  }
});

module.exports = router;
