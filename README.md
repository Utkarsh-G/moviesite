# moviesite
Movie Night Website. Initial intent is for Heroku deployment.

Example deployed at: movienightsite.herokuapp.com  
Deployed version may be behind repo in commits

Current version shows a list of movies after login. As of now, any successful login is given admin-level control and can delete movies or even reset the entire database.

The eventual goal is to have a site that friends (trusted parties) can use to select/suggest movies, pick dates, and choose what snacks they want to bring to a Movie Night. Each movie night is tied to a particular passkey, which is shared with friends through external means.


Config variables are in .env file. The following variables are used:

COOKIE_SECRET = any random set of letter and number to seed the cookie generator
SITE_PASSKEY = important. Default passkey to enter the site from the home page
TMDB_KEY = key for The Movie Database API. Can get by registering an account there and requesting a key

Heroku-specific process.env variable:
PORT
DYNO
MONGODB_URI
