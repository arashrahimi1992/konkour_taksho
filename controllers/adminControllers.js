const bcrypt=require('bcryptjs');
const adminModel=require('../models/admin');
const passport=require('passport');
const fetch=require('node-fetch');
const jwt = require("jsonwebtoken");
const { formatDate } = require("../utils/jalali");

// get admin login page-----------------------------------------------

exports.login=(req,res)=>{
    res.render("../views/adminViews/loginAdmin.ejs",
    { 
    pageTitle:"ورود به بخش مدیریت ",
    path:"/loginAdmin",
    layout:"layouts/MDBLayout",
    message: req.flash("success_msg"),
    error:req.flash("error"),
    });
    }

// post admin login |handle -------------------------------------------

exports.handleLogin = async (req, res, next) => {
console.log("captch",req.body["g-recaptcha-response"]);
if(!req.body["g-recaptcha-response"]){
    req.flash("error","اعتبار سنجی الزامی میباشد");
    return res.redirect("/admin/loginAdmin");
}

const secretKey=process.env.CAPTCHA_SECRET;
const verifyUrl= `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`
const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
});

const json = await response.json();
console.log(json);

if (json.success) {
    passport.authenticate("local", {
        failureRedirect: "/admin/loginAdmin",
        failureFlash: true,
    })(req, res, next);
} 
else 
{
    req.flash("error", "مشکلی در اعتبارسنجی captcha هست");
    res.redirect("/admin/loginAdmin");
}
    };
    
 //pot remember me ----------------------------------------------------  

 exports.rememberMe = (req, res) => {
        if (req.body.rememberMe) {
            req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000; // 1 day 24
        } else {
            req.session.cookie.expire = null;
        }
        res.redirect("/dashboard");
    };

//post admin logout-------------------------------------------------------

exports.logout=(req,res)=>{
    req.session=null;
    req.logout();
   // req.flash("success_msg","خروج موفقیت آمیز بود");
    res.redirect("/admin/loginAdmin");
}

//get admin register------------------------------------------------------

exports.register=(req,res)=>{
    res.render("../views/adminViews/registerAdmin.ejs",
    {
    pageTitle:"پیش ثبت نام در بخش مدیریت",
    path:"/registerAdmin",
    layout:"layouts/MDBLayout"
    });
};

//post admin handleRegister|create admin-----------------------------------

exports.handleRegister=async(req,res)=>{
    const errors=[];
        try{

            console.log(req.body);
            await adminModel.adminValidation(req.body);
            const {adminName,adminLastName,adminPhone,adminEmail,adminPassword} = req.body;
            const admin = await adminModel.findOne({ adminEmail });
            if (admin) {
                errors.push({ message: "کاربری با این ایمیل موجود است" });
                return res.render("../views/adminViews/registerAdmin.ejs", 
                {
                    pageTitle: "ثبت نام کاربر",
                    path: "/registerAdmin",
                    errors,
                });

            }else{ }  

        const hash = await bcrypt.hash(adminPassword, 10);
        await adminModel.create({  adminName,adminLastName,adminPhone,adminEmail, adminPassword:hash });
        req.flash("success_msg", "ثبت نام موفقیت آمیز بود.");
        res.redirect("/admin/loginAdmin");
        }
        catch(err){
           
            err.inner.forEach(e => {
            errors.push({
            name:e.path,
            message:e.message,
            });
        });

        return res.render("../views/adminViews/registerAdmin.ejs",{
            pageTitle:"ثبت نام",
            path:"/registerAdmin",
            layout:"layouts/MDBLayout",
            errors,
        })
}};

//-------------------------------------------------------------------------

exports.editPost = async (req, res) => {
    const errorArr = [];

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    const post = await Blog.findOne({ _id: req.params.id });
    try {
        if (thumbnail.name)
            await Blog.postValidation({ ...req.body, thumbnail });
        else
            await Blog.postValidation({
                ...req.body,
                thumbnail: {
                    name: "placeholder",
                    size: 0,
                    mimetype: "image/jpeg",
                },
            });

        if (!post) {
            return res.redirect("errors/404");
        }

        if (post.user.toString() != req.user._id) {
            return res.redirect("/dashboard");
        } else {
            if (thumbnail.name) {
                fs.unlink(
                    `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
                    async (err) => {
                        if (err) console.log(err);
                        else {
                            await sharp(thumbnail.data)
                                .jpeg({ quality: 60 })
                                .toFile(uploadPath)
                                .catch((err) => console.log(err));
                        }
                    }
                );
            }

            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;
            post.thumbnail = thumbnail.name ? fileName : post.thumbnail;

            await post.save();
            return res.redirect("/dashboard");
        }
    } catch (err) {
        console.log(err);
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("../views/adminViews/editPost.ejs", {
            pageTitle: "بخش مدیریت | ویرایش پست",
            path: "/dashboard/edit-post",
            layout: "./layouts/dashLayout",
            fullname: req.user.fullname,
            errors: errorArr,
            post,
        });
    }
};


exports.handleForgetPassword = async (req, res) => {
    const { adminEmail } = req.body;

    const user = await adminModel.findOne({ adminEmail: adminEmail });

    if (!user) {

        req.flash("error", "کاربری با ایمیل در پایگاه داده ثبت نیست");
        return res.render("../views/adminViews/forgetPass.ejs", {
            pageTitle: "فراموشی رمز عبور",
            path: "/login",
            message: req.flash("success_msg"),
            error: req.flash("error"),
        });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    const resetLink = `http://localhost:3000/admin/reset-password/${token}`;

    // sendEmail(
    //     user.adminEmail,
    //     user.adminName,
    //     "فراموشی رمز عبور",
    //     `
    //     جهت تغییر رمز عبور فعلی رو لینک زیر کلیک کنید
    //     <a href="${resetLink}">لینک تغییر رمز عبور</a>
    // `
    // );
   req.flash("success_msg",resetLink);
 
  //req.flash("success_msg", "ایمیل حاوی لینک با موفقیت ارسال شد");

    res.render("../views/adminViews/forgetPass.ejs", {

        pageTitle: "فراموشی رمز عبور",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
     

   });
};


exports.forgetPasswrod = async (req, res) => {
    res.render("./adminViews/forgetPass.ejs", {
        pageTitle: "فراموشی رمز عبور",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
    });
};


exports.resetPassword = async (req, res) => {
    const token = req.params.token;

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedToken);
    } catch (err) {
        console.log(err);
        if (!decodedToken) {
            return res.redirect("/404");
        }
    }

    res.render("./adminViews/resetPass.ejs", {
        pageTitle: "تغییر پسورد",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        userId: decodedToken.userId,
    });
};


exports.handleResetPassword = async (req, res) => {

    try{}
    catch(err){}

    const { adminPassword, adminConfirmPassword } = req.body;
    console.log(adminPassword, adminConfirmPassword);

    if (adminPassword !== adminConfirmPassword) {
        req.flash("error", "کلمه های عبور یکسان نیستند");

        return res.render("../views/adminViews/resetPass.ejs", {
            
            pageTitle: "تغییر پسورد",
            path: "/login",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            userId: req.params.id,
        });
    }
    else{}

    const user = await adminModel.findOne({ _id: req.params.id });

    if (!user) 
    {
        return res.redirect("/404");
    }

    user.adminPassword = adminPassword;
    await user.save();

    req.flash("success_msg", "پسورد شما با موفقیت بروزرسانی شد");
    res.redirect("/admin/loginAdmin");
    
};


