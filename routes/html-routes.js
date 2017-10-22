var request = require("request");
var cheerio = require("cheerio");
var Post = require("../models/post.js");

module.exports = function (app, db, appRoot) {
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
    request("https://pinchofyum.com/recipes", function (error, response, html) {
      if (error) throw error;
      var $ = cheerio.load(html);

      $("article.post-summary").each(function (i, element) {
        var result = {};
        result.title = $(element).find("div").text();
        result.link = $(element).find("a").attr("href");
        result.imgSource = $(element).find("img").attr("src");

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

    res.redirect("/");
  });

  app.get("/post/:id", function (req, res) {
    Post.findOne({
      "_id": req.params.id
    }, function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        console.log(doc);
        res.render("singlepost", doc);
      }
    });
  });

  app.post("/post/:id", function (req, res) {
    Post.findOneAndUpdate(
      {
        "_id": req.params.id
      },
      {
        $push: {comments: req.body.newcomment},
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
  });
};
