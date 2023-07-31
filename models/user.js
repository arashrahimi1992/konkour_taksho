const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');


const schema = new mongoose.Schema({

  userName:{type:String,required:true,trim:true,},
  userLastName:{type:String,required:true,trim:true,},
  userPassword:{type:String,required:true,minlength:4,maxlength:255,},
  userPhone:{type:Number,default:0,},
  userEmail:{type:String,required:true,unique:true,},
  userCreateAt:{type:Date,default:Date.now,},

});

schema.methods.generateAuthToken = function () {
  const data = {
    _id: this._id,
    userEmail: this.userEmail,
    role: "user",
  };

  return jwt.sign(data, config.get('jwtPrivateKey'));
};

const usermodel = mongoose.model('User', schema);

module.exports = usermodel;

