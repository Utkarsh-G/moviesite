var mongodb       = require('mongodb').MongoClient;

var ObjectId = require('mongodb').ObjectID;
var mongoURL = process.env.MONGODB_URI || "mongodb://localhost/movie";
var db; 

exports.Connect = function() {
    
    mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      console.log("error connecting to mongodb in database.js")
      console.log(err);
      callback(err);
      return;
    }

    db = conn.db("heroku_q50590lt");
    console.log('In database.js, connected to MongoDB at: %s', mongoURL);
  });
}

exports.GetDB = function() {
    return db;
}