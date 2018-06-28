var mdb = require('../services/database');
var base_url = "https://image.tmdb.org/t/p/";

module.exports = (app) => { 
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
          const hasDisplayReset = (req.session.movieDBname === "movies") || (req.session.userName === "Utkarsh Gaur");
          const movies = db.collection(req.session.movieDBname);
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
              const comments = db.collection(req.session.commentsDBname);
              comments.find().toArray(function(err, commArray){
                if(err)
                {
                  console.log("error in finding comments array from local db:");
                  console.log(err);
                  return res.render("index", {comments: null, movies : movArray, date: req.session.movieDate, displayReset: hasDisplayReset, loggedOn : isLogged, base_url: base_url, csrfToken:req.csrfToken()});
                  return;
                }
                else
                {
                  const guests = db.collection(req.session.guestsDBname);
                  guests.find().toArray(function(err, guestArray){
                    if(err)
                    {
                      console.log("error in finding guest array from local db:");
                      console.log(err);
                      return res.render("index", {guests: null, comments: commArray, movies : movArray, date: req.session.movieDate, displayReset: hasDisplayReset, loggedOn : isLogged, base_url: base_url, csrfToken:req.csrfToken()});
                    } 
                    else
                    {
                      return res.render("index", {guests: guestArray, comments: commArray, movies : movArray, date: req.session.movieDate, displayReset: hasDisplayReset, loggedOn : isLogged, base_url: base_url, csrfToken:req.csrfToken()});    
                    }
                  
                  });
                  
                }

              });
              
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