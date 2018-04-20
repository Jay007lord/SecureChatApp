const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// user schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email:{ type: String,
      required:true
 },
  confirmed:{
    type:Boolean,
    default:false
  }
});

UserSchema.statics.getUserById = function(id, callback) {
  User.findById(id, callback);
}

UserSchema.statics.getUserByUsername = function(username, callback) {
  let query = {username: username};
  User.findOne(query, callback);
}

UserSchema.statics.getUsers = () => {
return User.find({}, {password:0}/*'-password'*/);
}

UserSchema.statics.addUser = function(newUser, callback) {
  User.getUserByUsername(newUser.username, (err, user) => {
    if (err) return callback({msg: "There was an error on getting the user"});
   else if (user) {
      let error = {msg: "Username is already in use"};
      return callback(error);
    } 
    else {
        User.checkEmail(newUser.email, (err,user)=>{
        if (err) return callback({msg: "There was an error on getting the email"});
        if (user) {
          error = {msg: "Email is already in use"};
          return callback(error);
        }else{
              bcryptjs.genSalt(10, (err, salt) => {
                bcryptjs.hash(newUser.password, salt, (err, hash) => {
                  if (err){ 
                return callback({msg: "There was an error registering the new user"});   
                }
                newUser.password = hash;
                console.log(newUser);
                newUser.save(callback);
                
              });
          }); 
        
    
        }
      
      });
    }
  });
}
 
UserSchema.statics.checkEmail = (email,callback)=>{
 let query={email:email};
  User.findOne(query,callback);
}

UserSchema.statics.authenticate = function(username, password, callback) {
  User.getUserByUsername(username, (err, user) => {
    if (err) return callback({msg: "There was an error on getting the user"});
  
  
    if (!user) {
      let error = {msg: "User not found in database"};
      return callback(error);
    } else {
      if(user.confirmed===false) 
          return callback({msg:"User hasn't confirmed yet, Please Open your Email and confiremed your account"});  

      bcryptjs.compare(password, user.password, (err, result) => {
        if (result == true) {
          return callback(null, user);
        } else {
          let error = {msg: "Wrong username or password"};
          return callback(error);
        }
      });
    }
  });
};

UserSchema.statics.updateVerify=(email, callback)=>{
  User.findOneAndUpdate({email: email}, {$set:{ confirmed:true}}, {new: true} , function(err, doc){
    if(err){
        console.log("Something wrong when updating data!");
    }

    console.log(doc);
  });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;
