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
              
              addmovie.addMovieFromTMDB(348, "Sci-fi + horror. I haven't even seen it yet.", "admin", ()=>{
                addmovie.addMovieFromTMDB(284054, "It's so popular, who hasn't seen it yet? Movie so nice, I watched it twice", "admin", ()=>{
                  addmovie.addMovieFromTMDB(244786, "As my friend Dougle described it: An art movie filmed like a war movie", "admin", ()=>{
                    addmovie.addMovieFromTMDB(858, "Standard romcom fare. Feel-good movie of its year.", "admin", ()=>{
                      console.log("successfully added all four init movies");
                      db.collection("food").insertOne({type: "snack", desc:"funyuns", user:"admin"}, function(err, r){
                        if(err)
                        {
                        console.log("Failed to insert token food");
                        console.log(err);
                        }
                        else
                        {
                        console.log("Successfully inserted token food");
                        db.collection("food").drop(function(err, delOK){
                            if (err)
                            {
                            console.log("Failed to delete foods");
                            console.log(err);
                            }
                            else {
                            console.log("Food reset");
                            db.collection("comments").insertOne({text: "text", user:"admin"}, function(err, r){
                                if(err)
                                {
                                console.log("Failed to insert token comment");
                                console.log(err);
                                }
                                else
                                {
                                console.log("Successfully inserted token comment");
                                db.collection("comments").drop(function(err, delOK){
                                    if (err)
                                    {
                                    console.log("Failed to delete comments");
                                    console.log(err);
                                    }
                                    else {
                                    console.log("Comments reset");
                                    db.collection("guests").insertOne({name:"admin"}, function(err, r){
                                      if(err)
                                      {
                                      console.log("Failed to insert token guest");
                                      console.log(err);
                                      }
                                      else
                                      {
                                      console.log("Successfully inserted token guest");
                                      db.collection("guests").drop(function(err, delOK){
                                          if (err)
                                          {
                                          console.log("Failed to delete guests");
                                          console.log(err);
                                          }
                                          else {
                                          console.log("Guests reset");
                                          if (shouldRedirectToMovies)
                                          resHTTP.redirect("/movies");
                                          }
                                      });      
                                      }      
                              });
                                    }
                                });      
                                }      
                        });
                            }
                        });      
                        }      
                });
                    
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

exports.initKeys = function(site_key1_hash, site_key2_hash){
  var db = mdb.GetDB(); 
    if (db)
    {
        db.collection('movienights').updateOne({moviesDBname: "movies"},{$set:{hashkey:site_key1_hash}}, function(err, r){
        if(err)
        {
            console.log("Failed to update site key hash1");
            console.log(err);
        }
        else
        {
            console.log("Successfully updated site key hash1");
            db.collection('movienights').updateOne({moviesDBname: "moviesMarch18"},{$set:{hashkey:site_key2_hash}}, function(err, r){
              if (err)
            {
                console.log("Failed to update site key hash2");
                console.log(err);
            }
            else {
                console.log("Successfully updated both site key hashes");
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