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
                    console.log("DB reset");
                    res.redirect("/movies");
                    }
                });      
                }      
        });
        }
    });
}