var server = require("http");
var file_system = require("fs");
var my_url = require("url");
var form_access = require("formidable");
var mongodb = require("mongodb").MongoClient;

var my_mongo_url =
  "mongodb+srv://ahmet:ahmetahmet@cluster0.av3t9rc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

var client = new mongodb(my_mongo_url);

function mongo_db_get_data(res) {
  var my_db = client.db("batch2024");

  var query = {};

  my_db
    .collection("mern-project-data")
    .find(query)
    .toArray(function (err, result) {
      console.log(err);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(result));
      res.end();
    });
}

function insert_data_to_mongo(data) {
  var my_db = client.db("batch2024");

  my_db.collection("mern-project-data").insertOne(data, function (err) {
    console.log(err);
  });
}

server
  .createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    var query = my_url.parse(req.url, true);
    var my_path = query.pathname;

    if (my_path == "/") {
      file_system.readFile("index.html", function (err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      });
    } else if (my_path == "/form_submit") {
      var my_form = new form_access.IncomingForm();
      my_form.parse(req, function (err, field, file) {
        if (field.u_name != null) {
          var user_name = field.u_name;
          var user_age = field.u_age;
          var user_city = field.u_city;
          var user_hobby = field.u_hobby;
          var my_mongo_object = {
            name: user_name,
            age: user_age,
            city: user_city,
            hobby: user_hobby,
          };
          insert_data_to_mongo(my_mongo_object);
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("Form Submitted");
        res.end();
      });
    } else if (my_path == "/all_data") {
      mongo_db_get_data(res);
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      var return_string = "Incorrect path chosen";
      res.write(return_string);
      res.end();
    }
  })
  .listen(8080);
