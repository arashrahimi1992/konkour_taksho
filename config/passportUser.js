// const passport = require("passport");
// const { Strategy } = require("passport-local");
// const bcrypt = require("bcryptjs");

// const User = require("../models/user");

// passport.use(
  
//     new Strategy({ usernameField: "userEmail", passwordField: 'userPassword' }, async (userEmail, userPassword, done) => {
//         try {
//             const user = await User.findOne({ userEmail });
   
//             if (!user) {
//                 return done(null, false, {
//                     message: "کاربری با این ایمیل ثبت نشده",
//                 });
//             }

//             const isMatch = await bcrypt.compare(userPassword, user.userPassword);
//             if (isMatch) {
         
//                 return done(null, user); //req.admin
//             } else {
//                 return done(null, false, {
//                     message: "نام کاربری یا کلمه عبور صحیح نمی باشد",
//                 });
//             }
//         } catch (err) {
    
//             console.log(err);
//         }
//     })
// );


// passport.serializeUser((user, done) => {
   
//     done(null, user);
// });

// passport.deserializeUser((id, done) => {
 
//     User.findById(id, (err, user) => {
//         done(err, user);
//     });
// });
