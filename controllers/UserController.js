const _ = require('lodash');
const bcrypt = require('bcrypt');
const UserModel= require("../models/user")
const {
validateCreateUser,
validateLoginUser
} = require('../validator/UserValidator');
const { rest } = require('lodash');


class UserController {
  

  async login(req,res){
try{

  const { error } = validateLoginUser(req.body);
  if (error) return res.status(400).send({ message: error.message });

  let user = await UserModel.findOne({ userEmail: req.body.userEmail });
  if (!user)
    return res
      .status(400)
      .send({ message: 'کاربری با این ایمیل یا پسورد یافت نشد' });

  const result = await bcrypt.compare(req.body.UserPassword, user.UserPassword);
  if (!result)
    return res
      .status(400)
      .send({ message: 'کاربری با این ایمیل یا پسورد یافت نشد' });

  const token = user.generateAuthToken();
  res.header("Access-Control-Expose-headers","x-auth-token").header('x-auth-token', token).status(200).send({ success: true });

}
catch(err){


}
  }

  async register(req,res){
    const { error } = validateCreateUser(req.body);
    if (error) return res.status(400).send({ message: error.message });

    let user = await UserModel.findOne({ userEmail: req.body.userEmail });
    if (user)
      return res
        .status(400)
        .send({ message: 'کاربری با این ایمیل وجود دارد' });
    user = new UserModel(_.pick(req.body,["userName","userLastName","userPassword","userPhone","userEmail"]))

    const salt =await bcrypt.genSalt(10);
    user.userPassword = await bcrypt.hash(user.userPassword,salt);
    user = await user.save();

    const token = user.generateAuthToken();
    res.header("Access-Control-Expose-headers","x-auth-token").header('x-auth-token', token).status(200).send(user );
  }
  
}

module.exports = new UserController();
