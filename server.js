//  OpenShift sample Node application
var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mdb           = require('moviedb')('f966801bba64717541e531a67551ed33'),
    methodOv      = require("method-override"),
    expSanitizer  = require("express-sanitizer"),
    mongodb       = require('mongodb');

    var ObjectId = mongodb.ObjectID;

var ipLocal = '127.0.0.1';
var portLocal = 8080;
  
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOv("_method"));
app.use(expSanitizer()); //must be placed AFTER bodyParser

var port = process.env.PORT || portLocal,
    ip   = process.env.IP || ipLocal,
    mongoURL = "mongodb://localhost/movies";

var db = null;

//console.log("Trying to init DB");
mongoURL = mongoURL || "mongodb://localhost/movies";

/*
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

    db = conn;
    console.log('Connected to MongoDB at: %s', mongoURL);

    if (db) {
      initMovies();
    }

  });
};

var sampleMovies = [{name: "Bladerunner", year: 2017},
                    {name: "Jumanji2", year: 2017},
                    {name: "Whiplash", year: 2014}
                    ];

function initMovies(){
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
            console.log("Prev data deleted successfully. Creating new movie data.");
            db.collection('movies').insertMany(sampleMovies, function (err, res){
              if (err)
              {
                console.log("Failed to insert movies");
                console.log(err);
              }
              else {
                console.log("New Movie DB ready to go.");          
              }
            });
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

  // initialize db on server start if it's not already
  // initialized.
/*if (!db) {
  initDb(function(err){});
}*/

//Landing page / home page

app.get('/', function (req, res) {
  console.log("Routing GET");    
  res.render('home');

});

//RESTful Routes ... eventually
//INDEX route
app.get("/movies", function(req,res){
  
  if (db)
  {
    movies = db.collection('movies');
    movies.find().toArray(function(err, movArray){
      if(err)
      {
        console.log(err);
        res.render("index", {movies:null});
        return;
      }
      else
      {
        res.render("index", {movies : movArray});
      }
    });
  }
  else
  {
    res.render("index", {movies:null});
  }
});

//NEW route
app.get("/movies/new", function(req,res){
  if(db)
  res.render("new");
  else
  res.redirect("/movies");
});

//CREATE route
app.post("/movies", function(req,res){
  //sanitize input
  req.body.movie.name = req.sanitize(req.body.movie.name);
  req.body.movie.year = req.sanitize(req.body.movie.year);
  //create movie
  movies = db.collection('movies');
  movies.insertOne(req.body.movie, function(err, newMov){
    if(err){
      console.log("Error in trying to add new movie");
      console.log(err);
      res.render("new");
    }
    else
    {
      //redirect
      res.redirect("/movies");
    }
  });
});

//SHOW route
app.get("/movies/:id", function(req,res){
  if(db)
  {
    movies = db.collection('movies');
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
        res.render("show",{movie: foundMovie});
      }
    });
  }
  else
  {
    res.redirect("/movies");
  }
});

// EDIT route

app.get("/movies/:id/edit", function(req, res){
  if(db)
  {
    movies = db.collection('movies');

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
        res.render("edit",{movie: foundMovie});
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
  movies = db.collection('movies');
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
      res.redirect("/movies/"+req.params.id);
    }

  });
});

// DELETE route

app.delete("/movies/:id", function(req, res){
  movies = db.collection('movies');
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
      //redirect
      res.redirect("/movies");
    }

  });
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

/*
initDb(function(err){
  if (err)
  console.log('Error connecting to Mongo. Message:\n'+err);
});*/

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
