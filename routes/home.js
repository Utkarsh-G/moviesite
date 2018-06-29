var request       = require('request');

module.exports = (app) => { app.get('/', function (req, res) {
    console.log("Routing GET");
    var isLogged = false;
    if ((req.session && req.session.userID)){
      console.log("Active session found. Redirecting from home to index.");
      isLogged = true;
      return res.redirect("/movies");
    }
        
    var configRequestURL = 'https://api.themoviedb.org/3/configuration?api_key=' + process.env.TMDB_KEY;
    request(configRequestURL, function(error, response, body){
      if(!error && response.statusCode == 200){
        console.log(body);
        var info = JSON.parse(body);
        console.log(info.images.base_url);
        base_url = info.images.base_url;
      }
      if(error){
        console.log(error);
      }
      if(response.statusCode !== 200){
        console.log(response.statusCode);
      }
      return res.render('home',{wrongLogin: false, loggedOn:isLogged, csrfToken: req.csrfToken()});
    });
  });

};