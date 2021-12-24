const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const User = require("../model/User");
const History = require("../model/History");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const path = require("path");
const commaFunc = require("../utils/comma");

router.get("/dashboard", ensureAuthenticated, (req,res) => {
    try{
        return res.render("dashboard", {pageTitle: "Dashbaord", req, commaFunc, layout:'layout2'});
    }catch(err){
        return res.redirect("/");
    }
});

router.get("/profile", ensureAuthenticated, (req,res) => {
    try{
        return res.render("profile", {pageTitle: "Profile", req, layout:'layout2'});
    }catch(err){
        return res.redirect("/");
    }
});

router.get("/verify", ensureAuthenticated, (req,res) => {
    try{
        return res.render("verify", {pageTitle: "Verify", req, layout:'layout2'});
    }catch(err){
        return res.redirect("/");
    }
});

router.post("/verify", ensureAuthenticated, async(req,res) => {
    try{
        const {doc_type} = req.body;
        if(!doc_type){
            req.flash("error_msg", "Please select document type");
            return res.redirect("/verify");
        };
        if (!req.files || Object.keys(req.files).length === 0) {
            req.flash("error_msg", "Please upload a document");
            return res.redirect("/verify");
        }
        await User.updateOne({_id:req.user.id}, {
            verify_status: "pending"
        });
        req.flash("success_msg", "Document uploaded and is pending approval.");
        return res.redirect("/verify");
    }catch(err){
        console.log(err);
        req.flash("error_msg", "internal server error.");
        return res.redirect("/verify");
    }
});

router.get("/notification", ensureAuthenticated, (req,res) => {
    try{
        return res.render("notifications", {pageTitle: "Notification", req, layout:'layout2'});
    }catch(err){
        return res.redirect("/");
    }
});

router.get("/deposit", ensureAuthenticated, (req,res) => {
    try{
        return res.render("deposit", {pageTitle: "Deposit Funds", req, layout:'layout2'});
    }catch(err){
        return res.redirect("/");
    }
});

router.post("/deposit", ensureAuthenticated, (req,res) => {
    try{
        const {amount} = req.body;
        if(!amount) return res.redirect("/deposit");
        return res.redirect("/deposit-preview/"+amount);

    }catch(err){
        console.log(err);
        req.flash("error_msg", "internal server error.");
        return res.redirect("/deposit");
    }
});

router.get("/deposit-preview/:amount", ensureAuthenticated, (req,res) => {
    try{
        const {amount} = req.params;
        if(!amount) return res.redirect("/dashboard");

        const charge = 1+(0.01 * Number(amount));
        const payable = charge + Number(amount);

        return res.render("depositPreview", {
            pageTitle: "Deposit Funds",
            req,
            amount,
            payable,
            charge,
            layout:'layout2', 
        });
    }catch(err){
        req.flash("error_msg", "internal server error.");
        return res.redirect("/deposit");
    }
});

router.get("/deposit-confirm/:amount", ensureAuthenticated, (req,res) => {
    try{
        const {amount} = req.params;
        if(!amount) return res.redirect("/deposit-preview/"+amount);
        return res.render("depositConfirm", {
            pageTitle: "Deposit Funds",
            layout: 'layout2',
            req,
            amount,
        });
    }catch(err){
        req.flash("error_msg", "internal server error.");
        return res.redirect("/deposit-preview/"+amount);
    }
});

router.post("/make-deposit", ensureAuthenticated, (req,res) => {
    try{
        const {amount} = req.body;
        if(!amount){
            req.flash("error_msg", "Please enter amount to deposit");
            return res.redirect("/make-deposit");
        }

        let proof_img;
        let uploadPath;
        const filename = uuid.v4();

        if (!req.files || Object.keys(req.files).length === 0) {
            req.flash(error_msg, "Please upload a passport photograph");
            return res.redirect("/make-deposit");
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        proof_img = req.files.proof;
        const filenames = proof_img.name.split(/\./);
        const ext = filenames[filenames.length-1];
        const imageName = filename + "." + ext;
        uploadPath = path.join(__dirname, "../public/uploads/") + imageName;

        // Use the mv() method to place the file somewhere on your server
        proof_img.mv(uploadPath, async(err) => {
            if (err){
                console.log(err);
                req.flash("error_msg", "Error uploading image");
                return res.redirect("/make-deposit");
            }
            const newHist = {
                amount,
                userID: req.user.id,
                shortID: Math.random().toString(20).slice(2,8),
                user: req.user,
                type: "deposit",
                status: "pending",
                proof: imageName
            };
            const _newHist = new History(newHist);
            await _newHist.save();
            req.flash("success_msg", "Success, your deposit is pending approval.");
            return res.redirect("/history");
        });
    }catch(err){
        console.log(err);
        req.flash("error_msg", "internal server error.");
        return res.redirect("/history");
    }
});

router.get("/withdraw", ensureAuthenticated, (req,res) => {
    try{
        return res.render("withdraw", {pageTitle: "Withdraw Funds", req, layout:'layout2'});
    }catch(err){
        return res.redirect("/");
    }
});


router.post("/withdraw", ensureAuthenticated, async (req,res) => {
    try{
        const {amount} = req.body;
        const charge = 1+(0.01 * Number(amount));
        const payable = Number(amount) - charge;

        if(amount < 1000){
            req.flash("error_msg", "Minimum withdrawal is $1000");
            return res.redirect("/withdraw");
        }
        if(req.user.balance < amount){
            req.flash("error_msg", "Insufficient funds");
            return res.redirect("/withdraw");
        }

        return res.render("withdrawPreview", {
            pageTitle: "Withdraw Funds",
            req,
            amount,
            payable,
            charge,
            layout:'layout2', 
        });
    }
    catch(err){
    return res.redirect("/");
    }
});


router.get("/withdraw-confirm/:amount", ensureAuthenticated, (req,res) => {
    try{
        const {amount} = req.params;
        if(!amount) {
            req.flash
            return res.redirect("/withdraw-confirm/"+amount);
        }
        return res.render("withdrawConfirm", {
            pageTitle: "Withdraw Funds",
            layout: 'layout2',
            req,
            amount,
        });
    }catch(err){
        req.flash("error_msg", "internal server error.");
        return res.redirect("/withdraw-confirm");
    }
});

router.post("/make-withdraw", ensureAuthenticated, async (req,res) => {
    try{
        const {amount, pin, address, cashapp, method} = req.body;
        if(!amount || !pin){
            req.flash("error_msg", "Please enter all fields to withdraw");
            return res.redirect("/withdraw-confirm/"+amount);
        }
        if(method === "bitcoin" && !address){
            req.flash("error_msg", "Please Provide a valid wallet address");
            return res.redirect("/withdraw-confirm/"+amount); 
        }
        if(method === "cashapp" && !cashapp){
            req.flash("error_msg", "Please Provide a valid cashapp tag");
            return res.redirect("/withdraw-confirm/"+amount); 
        }
        if(req.user.balance < amount || amount < 0){
            req.flash("error_msg", "Insufficient balance. try and deposit.");
            return res.redirect("/withdraw-confirm/"+amount);
        }
        if(pin != 4567){
            req.flash("error_msg", "You have entered an incorrect PIN");
            return res.redirect("/withdraw-confirm/"+amount);
        }
        else{
            const newHist = {
                amount,
                shortID: Math.random().toString(20).slice(2,8),
                userID: req.user.id,
                user: req.user,
                type: "withdraw",
                status: "pending",
                gateway: address ? "Bitcoin" : "Cashapp",
                address: address ? address : cashapp
            };
            const _newHist = new History(newHist);
            await _newHist.save();
            await User.updateOne({_id:req.user.id}, {
                balance: req.user.balance - amount,
                profit: req.user.profit - amount
            });
            req.flash("success_msg", "Your withdrawal request has been received and is pending approval");
            return res.redirect("/withdraw-history/");
        }
    }catch(err){
        return res.redirect("/");
    }
});


router.post("/update-personal", ensureAuthenticated, async (req,res) => {
    try{
        const {fullname, email, password, password2} = req.body;

        console.log(req.body)

        if(!fullname || !email){
            req.flash("error_msg", "Provide fullname and email");
            return res.redirect("/settings");
        }

        if(password){
            if(password.length < 6){
                req.flash("error_msg", "Password is too short");
                return res.redirect("/settings");
            }
            if(password != password2){
                req.flash("error_msg", "Password are not equal");
                return res.redirect("/settings");
            }
        }

        const update = {
            fullname,
            email
        }

        if(password){
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password2, salt);
            update.password = hash;
        }

        await User.updateOne({_id: req.user.id}, update);
        req.flash("success_msg", "Account updated successfully")
        return res.redirect("/settings");

    }catch(err){

    }
});

router.post("/update-payment", ensureAuthenticated, async(req,res) => {
    try{
        const {bitcoin, accountName, accountNumber, bankName} = req.body;

        if(!bitcoin || !accountName || !accountNumber || !bankName){
            req.flash("error_msg", "Enter all fileds");
            return res.redirect("/settings");
        }

        const update = {
            bitcoin,
            accountName,
            accountNumber,
            bankName
        }
        await User.updateOne({_id: req.user.id}, update);
        req.flash("success_msg", "Account updated successfully")
        return res.redirect("/settings");

    }catch(err){
        req.flash("error_msg", "Something went wrong.")
        return res.redirect("/settings");
    }
});


router.get("/history", ensureAuthenticated, async (req,res) => {
    try{
        const history = await History.find({userID: req.user.id});
        return res.render("history", {pageTitle: "History", req, history, layout:'layout2'});
    }catch(err){
        req.flash("error_msg", "Something went wrong.")
        return res.redirect("/dashboard");
    }
});

router.get("/withdraw-history", ensureAuthenticated, async (req,res) => {
    try{
        const history = await History.find({userID: req.user.id, type:"withdraw"});
        return res.render("withdrawHistory", {pageTitle: "History", req, history, layout:'layout2'});
    }catch(err){
        req.flash("error_msg", "Something went wrong.")
        return res.redirect("/dashboard");
    }
});



module.exports = router;