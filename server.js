//  OpenShift sample Node application
var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mdb           = require('moviedb')('f966801bba64717541e531a67551ed33'),
    methodOv      = require("method-override"),
    expSanitizer  = require("express-sanitizer"),
    mongodb       = require('mongodb').MongoClient,
    sessions      = require('client-sessions'),
    bcrypt        = require('bcryptjs'),
    csurf         = require('csurf'),
    dotenv        = require('dotenv').config(),
    sslRedirect   = require('heroku-ssl-redirect'),
    request       = require('request');

    var ObjectId = require('mongodb').ObjectID;

var ipLocal = '127.0.0.1';
var portLocal = 8080;

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOv("_method"));
app.use(expSanitizer()); //must be placed AFTER bodyParser
app.use(sessions({
  cookieName:"session",
  secret:process.env.COOKIE_SECRET, //needs to be an env variable
  duration: 30 * 60 * 1000,
  cookie:{
    ephemeral: true,
    httpOnly: true,
    secure: false
  }
}));
app.use(csurf());
app.use(sslRedirect());

var hashKeyDB = bcrypt.hashSync(process.env.SITE_PASSKEY, 14); //needs to be env var or database
var hashKeyDB2 = bcrypt.hashSync(process.env.SITE_PASSKEY2, 14);

var port = process.env.PORT || portLocal,
    ip   = process.env.IP || ipLocal,
    mongoURL = process.env.MONGODB_URI || "mongodb://localhost/movie";

var db = null;
var collectionToUse = 'movies';
var base_url = "https://image.tmdb.org/t/p/";

var initDb = function(callback) {
  if (mongoURL == null) {console.log("mongoURL is null"); return;}
  else {console.log('mongoURL: %s', mongoURL);} 

  if (mongodb == null) {console.log("mongodb is null"); return;}

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      console.log("error connecting to mongodb")
      console.log(err);
      callback(err);
      return;
    }

    db = conn.db("heroku_q50590lt");
    console.log('Connected to MongoDB at: %s', mongoURL);

    if (db) {
      initMovies(false, null);
      initUsers();
      //initMovieNights();
    }

  });
};

var sampleMovies = [{name: "Alien", year: 1979, movie_id: 348, voters:["Utkarsh"]},
                    {name: "The Karate Kid", year: 1984, movie_id: 1885},
                    {name: "Whiplash", year: 2014, movie_id: 244786, voters:["Mike","Meng"]},
                    {name: "Sleepless in Seattle", year: 1993, movie_id:858}
                    ];

function initMovies(shouldRedirectToMovies, resHTTP){
  if (db)
  {
    db.collection(collectionToUse).insertOne({name: "El laberinto del fauno", year: 2006}, function(err, r){
      if(err)
      {
        console.log("Failed to insert token movie");
        console.log(err);
      }
      else
      {
        console.log("Successfully inserted token movie");
        db.collection(collectionToUse).drop(function(err, delOK){
          if (err)
          {
            console.log("Failed to delete movies");
            console.log(err);
          }
          else {
            console.log("Prev movie data deleted successfully. Creating new movie data.");
            
            addMovieFromTMDB(348, ()=>{
              addMovieFromTMDB(284054, ()=>{
                addMovieFromTMDB(244786, ()=>{
                  addMovieFromTMDB(858, ()=>{
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

function initUsers()
{
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

console.log("Trying to init DB");

if (!db) {
  initDb(function(err){
    if (err)
    console.log('Error connecting to Mongo. Message:\n'+err);
  });
}


//Landing page / home page

require('./routes/home')(app);

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

  if (db)
  {
    movies = db.collection(req.session.movieDBname);
    movies.find().toArray(function(err, movArray){
      if(err)
      {
        console.log("error in finding movie array from local db:");
        console.log(err);
        res.render("index", {movies:null, loggedOn: isLogged});
        return;
      }
      else
      {
        var hasDisplayReset = (req.session.movieDBname === "movies") || (req.session.userName === "Utkarsh Gaur");
        return res.render("index", {movies : movArray, displayReset: hasDisplayReset, loggedOn : isLogged, base_url: base_url, csrfToken:req.csrfToken()});
        
      }
    });
  }
  else
  {
    res.render("index", {movies:null, loggedOn: isLogged});
  }
});

//NEW route
app.get("/movies/new", function(req,res){
  if (!(req.session && req.session.userID)){
    console.log("no active session found.");
    return res.redirect("/");
  }
  var isLogged = true;
  if (db)
  {
    movies = db.collection(req.session.movieDBname);
    movies.find().toArray(function(err, movArray){
      if(movArray.length>9)
        res.send("Currently only supporting 10 movies max. Please delete one before adding new one.");
      if(db)
      {
        res.render("new",{loggedOn: isLogged, base_url: base_url, searches:req.session.searches, csrfToken: req.csrfToken()});
      }
      else
        res.redirect("/movies");
    });
  }
  
});

//CREATE route
app.post("/movies", function(req,res){
  console.log("in create's post route");

  addMovieFromTMDB(req.body.ID, (res)=>{
    res.redirect("/movies");
  },(res)=>{
    res.redirect("/movies/new");
  },res,req.session.movieDBname);
});

function addMovieFromTMDB(movie_id, funcIfSuccess, funcIfFail, PostRes, movieDBname){
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
      };

      movies = db.collection(movieDBname);
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

//SHOW route
app.get("/movies/:id", function(req,res){
  if (!(req.session && req.session.userID)){
    console.log("no active session found.");
    return res.redirect("/");
  }
  var isLogged = true;
  if(db)
  {
    movies = db.collection(req.session.movieDBname);
    movies.findOne({_id: ObjectId(req.params.id)}, function(err, foundMovie){ //_id:req.params.id
      if(err)
      {
        console.log("\n\nError in finding movie by id");
        console.log(err);
        res.send("Movie not found. Woopsie");
      }
      else
      {
        console.log("Showing movie info for Show route from our DB:");
        console.log(foundMovie);
        res.render("show",{movie: foundMovie, loggedOn: isLogged, base_url:base_url, csrfToken: req.csrfToken()});        
      }
    });
  }
  else
  {
    res.redirect("/movies");
  }
});

// EDIT route
/*
app.get("/movies/:id/edit", function(req, res){
  if (!(req.session && req.session.userID)){
    console.log("no active session found.");
    return res.redirect("/");
  }
  if(db)
  {
    movies = db.collection(collectionToUse);

    movies.findOne({_id: ObjectId(req.params.id)}, function(err, foundMovie){ //_id:req.params.id
      if(err)
      {
        console.log("\n\nError in finding movie by id");
        console.log(err);
        res.send("Movie not found. Woopsie");
      }
      else
      {
        console.log("\n\nFound by ID");
        console.log(foundMovie);
        res.render("edit",{movie: foundMovie, loggedOn: isLogged, csrfToken: req.csrfToken()});
      }
    });
  }
  else
  {
    res.redirect("/movies");
  }  
});

// UPDATE Route
app.put("/movies/:id", function(req,res){
  //sanitize input
  req.body.movie.name = req.sanitize(req.body.movie.name);
  req.body.movie.year = req.sanitize(req.body.movie.year);
  movies = db.collection(collectionToUse);
  movies.updateOne({_id: ObjectId(req.params.id)}, {$set:{
    name: req.body.movie.name,
    year: req.body.movie.year
  }}, function(err, r){

    if(err)
    {
      console.log("\n\nError in updating movie by id");
      console.log(err);
      res.send("Movie not updated. Woopsie.");
    }
    else
    {
      console.log("\n\nUpdated by ID");
      //redirect
      isMovieDataCached = false;
      res.redirect("/movies/"+req.params.id);
    }

  });
});
*/
// DELETE route

app.delete("/movies/:id", function(req, res){
  movies = db.collection(req.session.movieDBname);
  movies.deleteOne({_id: ObjectId(req.params.id)}, function(err, result){
    if(err)
    {
      console.log("\n\nError in deleting movie by id");
      console.log(err);
      res.send("Movie not deleted. Woopsie.");
    }
    else
    {
      console.log("\n\nDeleted by ID");
      res.redirect("/movies");
    }

  });
});

// RESET route
app.purge("/movies", function(req, res){
  if (req.session.movieDBname === "movies")
    initMovies(true,res);
  else
  {
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


//Login
app.post("/login", function(req,res){
  req.body.logInfo.name = req.sanitize(req.body.logInfo.name);
  req.body.logInfo.key = req.sanitize(req.body.logInfo.key);

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

//Logout

app.get("/logout", (req,res)=>{
  if(req.session){
    req.session.reset();
  }
  res.redirect("/");
})

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

//vote

app.post("/movies/:id/vote", (req,res)=>{

  movies = db.collection(req.session.movieDBname);

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

//Search
app.post("/movies/search", (req,res)=>{

  var options = { method: 'GET',
  url: 'https://api.themoviedb.org/3/search/movie',
  qs: 
   { year: req.body.movieYear,
     include_adult: 'false',
     page: '1',
     query: req.body.movieName,
     language: 'en-US',
     api_key: process.env.TMDB_KEY },
  body: '{}' };

request(options, function (error, response, body) {
  if (error) {console.log(error);}
  else
  {
    var info = JSON.parse(body);
    var searches= [];
    var maxCount = (info.total_results > 5) ? 5 : info.total_results;
    for (var i = 0; i < maxCount; i++)
    {
      var search = {
        name:info.results[i].title,
        ID:info.results[i].id,
        date:info.results[i].release_date,
        poster_path:info.results[i].poster_path
      };
      searches.push(search);
    }
    req.session.searches = searches;
    res.redirect("/movies/new");
  }
});
});

if(process.env.DYNO) //check for the presence of dyno to see if we are on heroku
{
  app.listen(port);
  console.log('Server running on Heroku on port %s', port);
}
else //if no DYNO, then we are local
{
  app.listen(port, ip);
  console.log('Server running on http://%s:%s', ip, port);
}

module.exports = app ;
