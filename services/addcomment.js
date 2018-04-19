var mdb = require('./database');

exports.addComment = function    (comment, commentDBname, funcIfSuccess, funcIfFail, PostRes){
     
        var db = mdb.GetDB();
        console.log("Name of comment DB in addcomments:");
        console.log(commentDBname);
        var commentDB = db.collection(commentDBname);
        commentDB.insertOne(comment, function(err, newComment){
        if(err){
          console.log("Error in trying to add new comment");
          console.log(err);
          return false;
          funcIfFail(PostRes);
        }
        else
        {
          console.log("Successfully inserted comment. Trying to return true.")
          funcIfSuccess(PostRes);
        }
        });
    }