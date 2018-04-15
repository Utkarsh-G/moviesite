var mdb = require('../services/database');
var addmovie = require('../services/addmovie');


module.exports = (app) => {
    app.post("/movies", function(req,res){
    console.log("in create's post route. Showing ID, Desc, and creator.");
    console.log(req.body.ID);
    console.log(req.body.desc);
    console.log(req.session.userName);
        
    addmovie.addMovieFromTMDB(req.body.ID, req.body.desc, req.session.userName, (res)=>{
      res.redirect("/movies");
    },(res)=>{
      res.redirect("/movies/new");
    },res,req.session.movieDBname);
  });
  
  
}