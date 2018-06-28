var mdb = require('./database');

exports.addGuest = function    (guest, guestsDBname, funcIfSuccess, funcIfFail, PostRes){
     
        var db = mdb.GetDB();
        console.log("Name of guest DB in addguests:");
        console.log(guestsDBname);
        var guestsDB = db.collection(guestsDBname);
        guestsDB.updateOne(guest,{$set: {name: guest.name}},{upsert:true}, function(err, newGuest){
        if(err){
          console.log("Error in trying to add new guest");
          console.log(err);
          funcIfFail(PostRes);
          return false;
        }
        else
        {
          console.log("Successfully inserted guest. Trying to return true.")
          funcIfSuccess(PostRes);
        }
        });
    }