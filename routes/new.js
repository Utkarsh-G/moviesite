var mdb = require('../services/database');

module.exports = (app, base_url) => { 
    app.get("/movies/new", function(req,res){
    if (!(req.session && req.session.userID)){
      console.log("no active session found.");
      return res.redirect("/");
    }
    var db = mdb.GetDB();
    var isLogged = true;
    if (db)
    {
      var movies = db.collection(req.session.movieDBname);
      movies.find().toArray(function(err, movArray){
        if(movArray.length>9)
          res.send("Currently only supporting 10 movies max. Please delete one before adding new one.");
        if(db)
        {
          res.render("new",{loggedOn: isLogged, base_url: base_url, searches:req.session.searches, csrfToken: req.csrfToken()});
        }
        else
          res.redirect("/movies");
      });
    }
    
  });
}