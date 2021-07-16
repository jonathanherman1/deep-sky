export {
    passUserToView,
    isLoggedIn
}

function passUserToView(req, res, next){
    console.log("res.locals: ", res.locals);
    res.locals.user = req.user ? req.user : null;
    console.log("res.locals after user: ", res.locals);
    next();
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/auth/google')
}