var mdb = require('../services/database');
var base_url = "https://image.tmdb.org/t/p/";

module.exports = (mongodb, app) => { 
  app.get("/movies", function(req,res){
    console.log("entering /movies route");
    if (!(req.session && req.session.userID)){
      console.log("no active session found.");
      return res.redirect("/");
    }
    var isLogged = true;
    console.log(req.session);
    console.log(req.session.userID);
    req.session.searches = null;

        var db = mdb.GetDB();
        if (db)
        {
          movies = db.collection(req.session.movieDBname);
          movies.find().toArray(function(err, movArray){
            if(err)
            {
              console.log("error in finding movie array from local db:");
              console.log(err);
              res.render("index", {movies:null, loggedOn: isLogged});
              return;
            }
            else
            {
              var hasDisplayReset = (req.session.movieDBname === "movies") || (req.session.userName === "Utkarsh Gaur");
              return res.render("index", {movies : movArray, displayReset: hasDisplayReset, loggedOn : isLogged, base_url: base_url, csrfToken:req.csrfToken()});
              
            }
          });
        }
        else
        {
          console.log("Database not found");
          res.render("index", {movies:null, loggedOn: isLogged});
        }    
    });  
}