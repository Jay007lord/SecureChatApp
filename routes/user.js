const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const log = require('../log');
const mongoose=require('mongoose');
var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: 'YOUR_EMAIL_ID',
      pass: 'YOUR_PASSWORD'
    }
});
var rand,mailOptions,host,link;
var loginPage="http://localhost:4200/login";

router.get('/verify',function(req,res){
console.log(req.protocol+":/"+req.get('host'));
if((req.protocol+"://"+req.get('host'))==("http://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    if(req.query.id == rand)
    {
      User.updateVerify(mailOptions.to,(err, user) => {
        if(err)	res.status(400).json({err:err});
        console.log('User is successfully verified');	
      });
      console.log("email is verified");
        res.end("<h1>Email "+mailOptions.to+" is been Successfully verified,now go to"+"<br><a href="+loginPage+">Click here to go to login page</a>");
    }
    else
    {
        console.log("email is not verified");
        res.end("<h1>Bad Request</h1>");
    }
}
else
{
    res.end("<h1>Request is from unknown source");
}
});



//===================================register-------------------- 
router.post('/register', (req, res, next) => {
  let response = {success: false};
  if (!(req.body.password == req.body.confirmPass)) {
    let err = 'The passwords don\'t match';
    return next(err);
  }
  else {
    let newUser = new User({
      username: req.body.username,
      email:req.body.email,
      password: req.body.password,
    });
    User.addUser(newUser, (err, user) => {
      if (err) {
        response.msg = err.msg || "Failed to register user";
        res.json(response);
      } else {
        response.success = true;
        response.msg = "User registered successfuly";
        response.user = {
          id: user._id,
          username: user.username
      }
        console.log("[%s] registered successfuly", user.username);
        
        rand = Math.floor((Math.random() * 100) + 54);
        host=req.get('host');
        link="http://"+req.get('host')+"/users/verify?id="+rand;
        console.log('Verification link ',link);
   
        mailOptions={
            to : newUser.email,
            subject : "Please confirm your Email account",
            html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>",
            text: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"  
        }
      
        smtpTransport.sendMail(mailOptions, function(error,res,next){
          if(error){
            console.log(error);
            }else{
          console.log("Mail has been sent"); 
          }
        });
        res.json(response);
      }
    });
   };
});
//===============================================Verification==============---------------------------


router.post("/authenticate", (req, res, next) => {
  let body = req.body;
  let response = {success: false};

  User.authenticate(body.username.trim(), body.password.trim(), (err, user) => {
    if (err) {
      response.msg = err.msg;
      res.json(response);
    } else { // create the unique token for the user
        let signData = {
          id: user._id,
          username: user.username
        };
        let token = jwt.sign(signData, config.secret, {
          expiresIn: 604800
        });

        response.token = "JWT " + token;
        response.user = signData;
        response.success = true;
        response.msg = "User authenticated successfuly";

        console.log("[%s] authenticated successfuly", user.username);
        res.json(response);
    }
  });
});

// profile
router.get('/profile', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  response.msg = "Profile retrieved successfuly";
  response.user = req.user;
  res.json(response);
});

// user list
router.get('/',  (req, res, next) => {
  User.getUsers()
    .then(users => {
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

module.exports = router;
