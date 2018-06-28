var mdb = require('../services/database');
var initdbs = require('../services/initdbs');

module.exports = (app) => { 

    app.purge("/movies", function(req, res){
        if (req.session.movieDBname === "movies")
            initdbs.initMovies(true,res);
        else
        {
            var db = mdb.GetDB();
            db.collection(req.session.movieDBname).insertOne({name: "El laberinto del fauno", year: 2006}, function(err, r){
                if(err)
                {
                console.log("Failed to insert token movie");
                console.log(err);
                }
                else
                {
                console.log("Successfully inserted token movie");
                db.collection(req.session.movieDBname).drop(function(err, delOK){
                    if (err)
                    {
                    console.log("Failed to delete movies");
                    console.log(err);
                    }
                    else {
                    console.log("Movies reset");
                    db.collection(req.session.foodDBname).insertOne({type: "snack", desc:"funyuns", user:"admin"}, function(err, r){
                        if(err)
                        {
                        console.log("Failed to insert token food");
                        console.log(err);
                        }
                        else
                        {
                        console.log("Successfully inserted token food");
                        db.collection(req.session.foodDBname).drop(function(err, delOK){
                            if (err)
                            {
                            console.log("Failed to delete foods");
                            console.log(err);
                            }
                            else {
                            console.log("Food reset");
                            db.collection(req.session.commentsDBname).insertOne({text: "text", user:"admin"}, function(err, r){
                                if(err)
                                {
                                console.log("Failed to insert token comment");
                                console.log(err);
                                }
                                else
                                {
                                console.log("Successfully inserted token comment");
                                db.collection(req.session.commentsDBname).drop(function(err, delOK){
                                    if (err)
                                    {
                                    console.log("Failed to delete comments");
                                    console.log(err);
                                    }
                                    else {
                                    console.log("Comments reset");
                                    db.collection(req.session.guestsDBname).insertOne({name:"admin"}, function(err, r){
                                        if(err)
                                        {
                                        console.log("Failed to insert token guest");
                                        console.log(err);
                                        }
                                        else
                                        {
                                        console.log("Successfully inserted token guest");
                                        db.collection(req.session.guestsDBname).drop(function(err, delOK){
                                            if (err)
                                            {
                                            console.log("Failed to delete guests");
                                            console.log(err);
                                            }
                                            else {
                                            console.log("guests reset");
                                            res.redirect("/movies");
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

                    }
                });      
                }      
        });
        }
    });
}