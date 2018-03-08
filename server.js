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
    var mdb = require('./services/database');
    var addmovie = require('./services/addmovie');
    var initdbs = require('./services/initdbs');

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
  mdb.Connect();
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
      initdbs.initMovies(false, null);
      initdbs.initUsers();
      initMovieNights();
    }

  });
};

function initMovieNights(){
  if (db)
  {
    db.collection("movienights").insertMany(
      [{moviesDBname: "movies", hashkey: hashKeyDB},
      {moviesDBname: "moviesMarch18", hashkey: hashKeyDB2}],
       function(err, r){
      if(err)
      {
        console.log("Failed to insert movie nights info");
        console.log(err);
      }
      else
      { 
        console.log("Successfully inserted MovieNights db info");
      }});
    }};

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
require('./routes/index')(mongodb, app);

//NEW route
require('./routes/new')(app,base_url);

//CREATE route
require('./routes/create')(app);

//SHOW route
require('./routes/show')(app, base_url);

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
require('./routes/delete')(app);

// RESET route
require('./routes/reset')(app);

//Login
require('./routes/login')(app);

//Logout
require('./routes/logout')(app);

//vote
require('./routes/vote')(app);

//Search
require('./routes/search')(app);

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

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

module.exports = app;