const router = require("express").Router();

router.get("/", (req,res) => {
    try{
        return res.render("index", {pageTitle: "Welcome", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/invest", (req,res) => {
    try{
        return res.render("invest", {pageTitle: "Plans", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/about", (req,res) => {
    try{
        return res.render("about", {pageTitle: "About Us", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/plans", (req,res) => {
    try{
        if(typeof req.user != 'undefined') return res.render("invest", {pageTitle: "plans", layout: "layout2", req});
        else res.render("plan", {pageTitle: "plans", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/plan", (req,res) => {
    try{
        if(typeof req.user != 'undefined') return res.render("invest", {pageTitle: "plans", layout: "layout2", req});
        else res.render("plan", {pageTitle: "plans", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/privacy", (req,res) => {
    try{
        return res.render("privacy", {pageTitle: "privacy", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/contact", (req,res) => {
    try{
        return res.render("contact", {pageTitle: "contact", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/subscribe", (req,res) => {
    try{
        return res.render("subscribe", {pageTitle: "subscribe", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

router.get("/blog", (req,res) => {
    try{
        return res.render("blog", {pageTitle: "blog", req});
    }
    catch(err){
        return res.redirect("/");
    }
});

module.exports = router;