var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var PORT = process.env.PORT || 3000;

mongoose.Promise = Promise;

var app = express();

mongoose.connect("mongodb://localhost/scraperdb");
var db = mongoose.connection;

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({
  extended: false
}));

db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function () {
  console.log("Mongoose connection successful.");
});

require("./routes/html-routes.js")(app, db);
require("./routes/api-routes.js")(app, db);

app.listen(PORT, function () {
  console.log("Listening on: " + PORT);
});
