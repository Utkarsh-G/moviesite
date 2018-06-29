var request       = require('request');

module.exports = (app) => { app.get('/wronglogin', function (req, res) {
    console.log("Routing GET");
    var isLogged = false;
    if ((req.session && req.session.userID)){
      console.log("Active session found. Redirecting from home to index.");
      isLogged = true;
      return res.redirect("/movies");
    }
    return res.render('home',{wrongLogin: true,loggedOn:isLogged, csrfToken: req.csrfToken()});

  });

};