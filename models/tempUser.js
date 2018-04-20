const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// user schema
const TempUserSchema = mongoose.Schema({
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

const TempUser = mongoose.model('TempUser', TempUserSchema);
module.exports = TempUser;


