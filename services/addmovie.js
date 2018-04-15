var mdb = require('./database');
var request = require('request');

//module.exports = function addMovieFromTMDB
exports.addMovieFromTMDB = function    (movie_id, desc, auth, funcIfSuccess, funcIfFail, PostRes, movieDBname){
    reqString = "https://api.themoviedb.org/3/movie/"+movie_id+"?api_key="+process.env.TMDB_KEY
  
    request(reqString, function(error, response, body){
      if(!error && response.statusCode == 200){
        //create movie
        var info = JSON.parse(body);
        var movie = {
          movie_id : info.id,
          name : info.title,
          year : info.release_date,
          poster_path : info.poster_path,
          runtime : info.runtime,
          overview : info.overview,
          desc: desc,
          auth: auth,
        };

        var db = mdb.GetDB();
        var movies = db.collection(movieDBname);
        movies.insertOne(movie, function(err, newMov){
        if(err){
          console.log("Error in trying to add new movie");
          console.log(err);
          return false;
          funcIfFail(PostRes);
        }
        else
        {
          console.log("Successfully inserted movie. Trying to return true.")
          funcIfSuccess(PostRes);
        }
        });
      }
      else {
        if(error){
          console.log(error);
          console.log("Womp womp. Something went wrong when trying to add movie. Unable to check if TMDB id is correct.");
        }
        if(response.statusCode !== 200){
          console.log(response.statusCode);
          console.log("Something went wrong when trying to add movie. Please check if your TMDB ID is valid and try again.");
        }
        funcIfFail();
      }
    });
  }