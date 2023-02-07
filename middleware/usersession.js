module.exports ={
    isLogged:(req,res,next) =>{
        if(req.session.user){
            console.log('po')
            next();   
        }
        else{
            res.redirect('/login')
                }
    },
    notLogged:(req,res,next)=>{
      if(!req.session.user){
        console.log("lo");
        next();
      }else{
        res.redirect('/home')
      }
    }
}