var mdb = require('../services/database');
var ObjectId = require('mongodb').ObjectID;

module.exports = (app) => { 

app.post("/movies/:id/vote", (req,res)=>{

    var db = mdb.GetDB();

    var movies = db.collection(req.session.movieDBname);
  
    movies.findOne({_id: ObjectId(req.params.id)}, function(err, foundMovie){ //_id:req.params.id
      if(err)
      {
        console.log("\n\nError in finding movie by id when trying to vote");
        console.log(err);
        res.send("Vote not registered (Movie not found). Woopsie");
      }
      else
      {
        console.log("\n\nFound by ID");
        console.log(foundMovie);
        var voters = [];
        if(foundMovie.voters)
          {
            voters = foundMovie.voters; 
            if(voters.length<21)
            voters.push(req.session.userName);
          }
        else
          voters =[req.session.userName];
  
        movies.updateOne({_id: ObjectId(req.params.id)}, {$set:{
          voters:voters
        }}, function(err, r){
          if(err)
          {
            console.log("\n\nError in updating movie voter list");
            console.log(err);
            res.send("Vote not registered (update error). Woopsie.");
          }
          else
          {
            console.log("\n\nUpdated by ID");
            res.redirect("/movies");
          }
      
        });
        
      }
    });
  
  });
  
}