var mdb = require('../services/database');

module.exports = (app) => { 
  app.get("/food", function(req,res){
    console.log("entering /food route");
    if (!(req.session && req.session.userID)){
      console.log("no active session found.");
      return res.redirect("/");
    }
    var isLogged = true;
    console.log(req.session);
    console.log(req.session.userID);
    req.session.searches = null;
    console.log("food db name?");
    console.log(req.session.foodDBname);



        var db = mdb.GetDB();
        if (db)
        {
          foodDB = db.collection(req.session.foodDBname);
          foodDB.find().toArray(function(err, foodArray){
            if(err)
            {
              console.log("error in finding food array from local db:");
              console.log(err);
              res.render("food", {food:null, loggedOn: isLogged});
              return;
            }
            else
            {
              console.log("show food array");
              console.log(foodArray);
              var hasDisplayReset = (req.session.movieDBname === "movies") || (req.session.userName === "Utkarsh Gaur");
              return res.render("food", {food : foodArray, date: req.session.movieDate, displayReset: hasDisplayReset, loggedOn : isLogged, csrfToken:req.csrfToken()});              
            }
          });
        }
        else
        {
          console.log("Food Database not found");
          res.render("food", {food:null, loggedOn: isLogged});
        }    
    });  
}