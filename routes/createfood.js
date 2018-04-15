var mdb = require('../services/database');
var addfood = require('../services/addfood');


module.exports = (app) => {
    app.post("/food", function(req,res){
    console.log("in createfood's post route. Showing body and creator.");
    console.log(req.body);
    console.log(req.session.userName);

    const food = {
        type:req.body.foodType,
        desc:req.body.desc,
        user:req.session.userName
    }
        
//     addmovie.addMovieFromTMDB(req.body.ID, req.body.desc, req.session.userName, (res)=>{
//       res.redirect("/movies");
//     },(res)=>{
//       res.redirect("/movies/new");
//     },res,req.session.movieDBname);
//   });

    addfood.addFood(food,req.session.foodDBname,(res)=>{
               res.redirect("/food");
             },(res)=>{
               res.redirect("/food");
             },res);
  
  
});
}