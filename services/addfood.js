var mdb = require('./database');

exports.addFood = function    (food, foodDBname, funcIfSuccess, funcIfFail, PostRes){
     
        var db = mdb.GetDB();
        var foodDB = db.collection(foodDBname);
        foodDB.insertOne(food, function(err, newFood){
        if(err){
          console.log("Error in trying to add new food");
          console.log(err);
          return false;
          funcIfFail(PostRes);
        }
        else
        {
          console.log("Successfully inserted food. Trying to return true.")
          funcIfSuccess(PostRes);
        }
        });
    }