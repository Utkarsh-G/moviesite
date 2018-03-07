var request       = require('request');

module.exports = (app, db, collectionToUse) => { 
  //RESTful Routes ... eventually
  //INDEX route
  app.get("/movies", function(req,res){
    console.log("entering /movies route");
    if (!(req.session && req.session.userID)){
      console.log("no active session found.");
      return res.redirect("/");
    }
    var isLogged = true;
    console.log(req.session);
    console.log(req.session.userID);
    req.session.searches = null;
    if(isMovieDataCached)
    {
      return res.render("index", {movies : movieArray, loggedOn : isLogged, base_url: base_url, csrfToken:req.csrfToken()});
    }
  
    if (db)
    {
      movies = db.collection(collectionToUse);
      movies.find().toArray(function(err, movArray){
        if(err)
        {
          console.log(err);
          res.render("index", {movies:null, loggedOn: isLogged});
          return;
        }
        else
        {
          if(movArray.length < 11 && movArray.length > 0){
              console.log("array length %d", movArray.length);
              var index = movArray.length - 1;
              GetMoviePosterPath(movArray, index,res, req);
              //console.log("Sequential? hopefully comes after movie poster path");
            
          //console.log();
          }else{
            res.send("Too many or too few movies to render");
            console.log(movArray.length);
          }
          
        }
      });
    }
    else
    {
      res.render("index", {movies:null, loggedOn: isLogged});
    }
  });

};

function GetMoviePosterPath(movArray, index, res, req){
    if(index > -1)
    {
      if(!movArray[index].movie_id)
      {
        movArray[index].movie_id = 419430;
      }
      reqString = "https://api.themoviedb.org/3/movie/"+movArray[index].movie_id+"?api_key="+process.env.TMDB_KEY;
      request(reqString, function(error, response, body){
        if(!error && response.statusCode == 200){
          var info = JSON.parse(body);
          console.log(info.poster_path);
  
          movArray[index].poster_path = info.poster_path;
          
          GetMoviePosterPath(movArray,index-1,res, req);
        }
        if(error){
          console.log(error);
        }
        if(response.statusCode !== 200){
          console.log(response.statusCode);
        }
        return null;
      });
      
    } else {
      console.log("printing poster path of 0th object");
      console.log(movArray[0].poster_path);
      movieArray = movArray;
      isMovieDataCached = true;
      res.render("index", {movies : movArray, loggedOn : isLogged, base_url:base_url, csrfToken:req.csrfToken()});
    }
    
  
  }