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
    sslRedirect   = require('heroku-ssl-redirect');

    var ObjectId = require('mongodb').ObjectID;

var ipLocal = '127.0.0.1';
var portLocal = 8080;

var isLogged = false;

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

var port = process.env.PORT || portLocal,
    ip   = process.env.IP || ipLocal,
    mongoURL = process.env.MONGODB_URI || "mongodb://localhost/movie";

var db = null;

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
            console.log("Prev movie data deleted successfully. Creating new movie data.");
            db.collection('movies').insertMany(sampleMovies, function (err, res){
              if (err)
              {
                console.log("Failed to insert movies");
                console.log(err);
              }
              else {
                console.log("New Movie DB ready to go.");
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
                        console.log("Database Clean");
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
  else 
  {
    console.log("no definition for db :(")
  }
  
}

  // initialize db on server start if it's not already
  // initialized.
console.log("Trying to init DB");

if (!db) {
  initDb(function(err){
    if (err)
    console.log('Error connecting to Mongo. Message:\n'+err);
  });
}

//Landing page / home page

app.get('/', function (req, res) {
  console.log("Routing GET");    
  res.render('home',{loggedOn:isLogged, csrfToken: req.csrfToken()});

});

//RESTful Routes ... eventually
//INDEX route
app.get("/movies", function(req,res){
  console.log("entering /movies route");
  if (!(req.session && req.session.userID)){
    console.log("no active session found.");
    return res.redirect("/");
  }
  console.log(req.session);
  console.log(req.session.userID);
  if (db)
  {
    movies = db.collection('movies');
    movies.find().toArray(function(err, movArray){
      if(err)
      {
        console.log(err);
        res.render("index", {movies:null, loggedOn: isLogged});
        return;
      }
      else
      {
        res.render("index", {movies : movArray, loggedOn : isLogged});
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
  if(db)
  res.render("new",{loggedOn: isLogged, csrfToken: req.csrfToken()});
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
      res.render("new",{loggedOn: isLogged});
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
        res.render("show",{movie: foundMovie, loggedOn: isLogged, csrfToken: req.csrfToken()});
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

//Login
app.post("/login", function(req,res){
  req.body.logInfo.name = req.sanitize(req.body.logInfo.name);
  req.body.logInfo.key = req.sanitize(req.body.logInfo.key);

  users = db.collection('users');

  if(bcrypt.compareSync(req.body.logInfo.key,hashKeyDB))//(req.body.logInfo.key === "test")
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
        isLogged = true;
        res.redirect("/movies");
      }
    });
  }
  else
  {
    res.redirect("/");
  }
  
});

app.get("/logout", (req,res)=>{
  if(req.session){
    req.session.reset();
    isLogged = false;
  }
  res.redirect("/");
})

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


/*initDb(function(err){
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
