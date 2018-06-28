var mdb = require('../services/database');
var addGuest = require('../services/addguest');


module.exports = (app) => {
    app.post("/guests", function(req,res){
    console.log("in createguest's post route. Showing body and creator.");
    console.log(req.body);
    console.log(req.session.userName);

    const guest = {
        name:req.session.userName
    }
    addGuest.addGuest(guest,req.session.guestsDBname,(res)=>{
        res.redirect("/movies");
      },(res)=>{
        res.redirect("/movies");
      },res);


});
}