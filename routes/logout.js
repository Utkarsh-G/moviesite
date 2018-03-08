
module.exports = (app) => { 
    app.get("/logout", (req,res)=>{
        if(req.session){
        req.session.reset();
        }
        res.redirect("/");
    })
}