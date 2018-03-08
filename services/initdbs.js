var mdb = require('./database');
var addmovie = require('./addmovie');

exports.initMovies = function(shouldRedirectToMovies, resHTTP){
    var db = mdb.GetDB();
    if (db)
    {
      db.collection('movies').insertOne({name: "El laberinto del fauno", year: 2006}, function(err, r){
        if(err)
        {
          console.log("Failed to insert token movie");
          console.log(err);
        }
        else
        {
          console.log("Successfully inserted token movie");
          db.collection('movies').drop(function(err, delOK){
            if (err)
            {
              console.log("Failed to delete movies");
              console.log(err);
            }
            else {
              console.log("Prev movie data deleted successfully. Creating new movie data.");
              
              addmovie.addMovieFromTMDB(348, ()=>{
                addmovie.addMovieFromTMDB(284054, ()=>{
                  addmovie.addMovieFromTMDB(244786, ()=>{
                    addmovie.addMovieFromTMDB(858, ()=>{
                      console.log("successfully added all four init movies");
                      if (shouldRedirectToMovies)
                      resHTTP.redirect("/movies");
                    },()=>{console.log("failed to add fourth init movie");},null,"movies");
                  },()=>{console.log("failed to add third init movie");},null,"movies");
                },()=>{console.log("failed to add second init movie");},null,"movies");
              },()=>{console.log("failed to add first init movie");},null,"movies");
            }
        
          });
        }
  
      });
      
    }
    else 
    {
      console.log("no definition for db :(")
    }
    
}

exports.initUsers =  function()
{
    var db = mdb.GetDB();
    if (db)
    {
        
        db.collection('users').insertOne({name: "Roshan"}, function(err, r){
        if(err)
        {
            console.log("Failed to insert token user");
            console.log(err);
        }
        else
        {
            console.log("Successfully inserted token users");
            db.collection('users').drop(function(err, delOK){
            if (err)
            {
                console.log("Failed to delete users");
                console.log(err);
            }
            else {
                console.log("User Database Clean");
            }
        
            });
        }

        });          
                
    }
    else 
    {
        console.log("no definition for db :(")
    }
}