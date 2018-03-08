var mdb = require('../services/database');
var addmovie = require('../services/addmovie');


module.exports = (app) => {
    app.post("/movies", function(req,res){
    console.log("in create's post route");
        
    addmovie.addMovieFromTMDB(req.body.ID, (res)=>{
      res.redirect("/movies");
    },(res)=>{
      res.redirect("/movies/new");
    },res,req.session.movieDBname);
  });
  
  
}