var mdb = require('../services/database');
var bcrypt        = require('bcryptjs');

module.exports = (app) => { 
    app.post("/login", function(req,res){
    req.body.logInfo.name = req.sanitize(req.body.logInfo.name);
    req.body.logInfo.key = req.sanitize(req.body.logInfo.key);
  
    var db = mdb.GetDB();
    users = db.collection('users');
    movienights = db.collection('movienights');
    movienights.find().toArray(function(err, mnArray){
    if(err){
        console.log("Error in finding movie night collection.");
        console.log(err);
        res.redirect("/");
    }
      
    var isMatch = false;
    var movieDBname = "";
    console.log("Trying to find the right movie night to log into");
      mnArray.forEach(function(mnight){
        console.log(mnight);
        if(bcrypt.compareSync(req.body.logInfo.key, mnight.hashkey)){
          isMatch = true;
          movieDBname = mnight.moviesDBname;
          console.log("found movie night match");
        }
      });
  
      if (isMatch)
      {
        users.insertOne({name:req.body.logInfo.name}, function(err, newUser){
          if(err){
            console.log("Error in trying to add new user");
            console.log(err);
            res.redirect("/");
          }
          else 
          {
            console.log("Success adding new user");
            console.log("\nUsername:%s",newUser.ops[0].name);
            console.log("\nid:%s",newUser.ops[0]._id);
            req.session.userID = newUser.ops[0]._id; //want to hash it tbh
            req.session.userName = newUser.ops[0].name;
            req.session.movieDBname = movieDBname;
            res.redirect("/movies");
          }
        });
      }
      else
      {
        console.log("Incorrect login");
        res.redirect("/");
      }
    });
  });
}  