var Post = require("../models/post.js");
var Comment = require("../models/comment.js");

module.exports = function (app, db) {
  app.get("/api/all", function (req, res) {
    Post.find({})
      .populate("comments")
      .exec(function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          res.json(doc);
        }
      });
  });
};
