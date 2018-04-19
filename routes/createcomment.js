var mdb = require('../services/database');
var addComment = require('../services/addcomment');


module.exports = (app) => {
    app.post("/comments", function(req,res){
    console.log("in createcomment's post route. Showing body and creator.");
    console.log(req.body);
    console.log(req.session.userName);

    const comment = {
        text:req.body.text,
        user:req.session.userName
    }
    addComment.addComment(comment,req.session.commentsDBname,(res)=>{
        res.redirect("/movies");
      },(res)=>{
        res.redirect("/movies");
      },res);


});
}