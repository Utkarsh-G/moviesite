var mdb = require('../services/database');
var ObjectId = require('mongodb').ObjectID;

module.exports = (app) => { 
    app.delete("/movies/:id", function(req, res){
    var db = mdb.GetDB();
    var movies = db.collection(req.session.movieDBname);
    movies.deleteOne({_id: ObjectId(req.params.id)}, function(err, result){
      if(err)
      {
        console.log("\n\nError in deleting movie by id");
        console.log(err);
        res.send("Movie not deleted. Woopsie.");
      }
      else
      {
        console.log("\n\nDeleted by ID");
        res.redirect("/movies");
      }
  
    });
  });
}