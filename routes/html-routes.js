var request = require("request");
var cheerio = require("cheerio");
var Post = require("../models/post.js");
var Comment = require("../models/comment.js");

module.exports = function (app, db) {
  app.get("/", function (req, res) {
    Post.find({}, function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        var handlebarsObject = {
          postList: doc
        };

        res.render("index", handlebarsObject);
      }
    });
  });

  app.get("/scrape", function (req, res) {
    request("https://pinchofyum.com/blog/", function (error, response, html) {
      if (error) throw error;
      var $ = cheerio.load(html);

      $("article.post-summary").each(function (i, element) {
        var result = {};
        result.title = $(element).find("div.entry-right").find("h2.entry-title").text();
        result.link = $(element).find("div.entry-left").find("a").attr("href");
        result.imgSource = $(element).find("div.entry-left").find("a").find("img").attr("src");

        var entry = new Post(result);

        entry.save(function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log(doc);
          }
        });
      });
    });

    res.render("scrape");
  });

  app.get("/post/:id", function (req, res) {
    Post.findOne({
      "_id": req.params.id
    })
      .populate("comments")
      .exec(function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          console.log(doc);
          res.render("singlepost", doc);
        }
      });
  });

  app.get("/saved", function (req, res) {
    Post.find({
      "saved": true
    })
      .populate("comments")
      .exec(function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          var handlebarsObject = {
            postList: doc
          };

          res.render("save", handlebarsObject);
        }
      });
  });

  app.post("/post/:id", function (req, res) {
    var newComment = new Comment();

    newComment.text = req.body.newcomment;

    newComment.save(function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        Post.findOneAndUpdate(
          {
            "_id": req.params.id
          },
          {
            $push: {"comments": doc._id, $sort: 1},
            "saved": true
          })
          .exec(function (err, doc) {
            if (err) {
              console.log(err);
            } else {
              console.log(doc);
              res.redirect("/");
            }
          });
      }
    });
  });

  app.post("/remove/comment/:id", function (req, res) {
    Comment.findOneAndRemove({
      "_id:": req.params.id
    })
      .exec(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          Post.update({
            "comments": req.params.id
          },
          {
            $pull: {
              "comments": req.params.id
            }
          }, function (err, doc) {
            if (err) {
              console.log(err);
            } else {
              res.end();
            }
          });
        }
      });
  });
};
