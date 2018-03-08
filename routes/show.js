var mdb = require('../services/database');
var ObjectId = require('mongodb').ObjectID;

module.exports = (app, base_url) => { 

app.get("/movies/:id", function(req,res){
    if (!(req.session && req.session.userID)){
      console.log("no active session found.");
      return res.redirect("/");
    }
    var isLogged = true;
    var db = mdb.GetDB();
    if(db)
    {
      movies = db.collection(req.session.movieDBname);
      movies.findOne({_id: ObjectId(req.params.id)}, function(err, foundMovie){ //_id:req.params.id
        if(err)
        {
          console.log("\n\nError in finding movie by id");
          console.log(err);
          res.send("Movie not found. Woopsie");
        }
        else
        {
          console.log("Showing movie info for Show route from our DB:");
          console.log(foundMovie);
          res.render("show",{movie: foundMovie, loggedOn: isLogged, base_url:base_url, csrfToken: req.csrfToken()});        
        }
      });
    }
    else
    {
      res.redirect("/movies");
    }
  });
}