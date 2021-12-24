const router = require("express").Router();
const User = require("../model/User");
const passport = require("passport");
const bcrypt = require("bcryptjs");

router.get("/login", (req,res) => {
    try{
        return res.render("login", {pageTitle: "Login", req});
    }catch(err){
        return res.redirect("/");
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});


router.get("/signup", (req,res) => {
    try{
        return res.render("signup", {pageTitle: "Signup", req});
    }catch(err){
        return res.redirect("/");
    }
});


router.post('/signup', async (req,res,next) => {
    try{
        const {username, firstname, lastname, email, phone, country, country_code, password, password2} = req.body;
        const user = await User.findOne({email, username});
        const user1 = await User.findOne({username});
        if(user || user1){
            return res.render("signup", {...req.body,error_msg:"A User with that email or username already exists", pageTitle: "Signup"});
        } else{
            if(!username || !firstname || !lastname || !country || !country_code || !email || !phone || !password || !password2){
                return res.render("signup", {...req.body,error_msg:"Please fill all fields", pageTitle: "Signup"});
            }else{
                if(password !== password2){
                    return res.render("signup", {...req.body,error_msg:"Both passwords are not thesame", pageTitle: "Signup"});
                }
                if(password2.length < 6 ){
                    return res.render("signup", {...req.body,error_msg:"Password length should be min of 6 chars", pageTitle: "Signup"});
                }
                
                const newUser = {
                    username,
                    firstname,
                    lastname,
                    email,
                    phone,
                    country,
                    country_code,
                    password
                };
                const salt = await bcrypt.genSalt();
                const hash = await bcrypt.hash(password2, salt);
                newUser.password = hash;
                const _newUser = new User(newUser);
                await _newUser.save();

                passport.authenticate('local', {
                    successRedirect: '/dashboard',
                    failureRedirect: '/login',
                    failureFlash: true
                })(req, res, next);
            }
        }
    }catch(err){
        console.log(err)
    }
})



module.exports = router;