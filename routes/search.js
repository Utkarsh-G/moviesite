var mdb = require('../services/database');
var request = require('request');

module.exports = (app) => { 

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
}