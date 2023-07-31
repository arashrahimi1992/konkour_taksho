const Blog = require("../models/Blog");
const contactModel=require('../models/contact');
const { formatDate } = require("../utils/jalali");
const { truncate } = require("../utils/helpers");
const Yup = require("yup");
const captchapng = require("captchapng");
let CAPTCHA_NUM;




exports.getIndex = async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 4;

    try {
        const numberOfPosts = await Blog.find({ status: "public" }).countDocuments();

        const posts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


        res.render("firstPage", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            layout:"layouts/MDBLayout",
            formatDate,
            truncate, 
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
         
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500",{pageTitle:"خطا", path:"error"});

    }
};


exports.getSinglePost = async (req, res) => {
    try {

        const post = await Blog.findOne({ _id: req.params.id }).populate( "user" );
console.log(post)
        if (!post) return res.redirect("errors/404");

        res.render("./adminViews/post.ejs", {
            pageTitle: post.title,
            path: "/post",
            post,
            layout:"layouts/MDBLayout",
            formatDate,
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500",{pageTitle:"خطا",path:"error"});
    }
};


exports.getContactPage = (req, res) => {
    res.render("./userViews/contact.ejs", {
        pageTitle: "تماس با ما",
        path: "/contact",
        layout:"layouts/MDBLayout",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: [],
    });
};


exports.handleContactPage = async (req, res) => {
    const errorArr = [];

    const { fullname, email, message, captcha } = req.body;

    const schema = Yup.object().shape({
        fullname: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
        email: Yup.string()
            .email("آدرس ایمیل صحیح نیست")
            .required("آدرس ایمیل الزامی می باشد"),
        message: Yup.string().required("پیام اصلی الزامی می باشد"),
    });


    
    
    try {
        await schema.validate(req.body, { abortEarly: false });
        await contactModel.create({ fullname,email,message });
        if (parseInt(captcha) === CAPTCHA_NUM) {
            // sendEmail(
            //     email,
            //     fullname,
            //     "پیام از طرف وبلاگ",
            //     `${message} <br/> ایمیل کاربر : ${email}`
            // );

            req.flash("success_msg", "پیام شما با موفقیت ارسال شد");

            return res.render("./userViews/contact", {
                pageTitle: "تماس با ما",
                path: "/contact",
                message: req.flash("success_msg"),
                error: req.flash("error"),
                errors: errorArr,            
                layout:"layouts/MDBLayout",
            });
        }

        req.flash("error", "کد امنیتی صحیح نیست");

        res.render("./userViews/contact", {
            pageTitle: "تماس با ما",
            path: "/contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
            layout:"layouts/MDBLayout",
        });
    } catch (err) {
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("./userViews/contact", {
            pageTitle: "تماس با ما",
            path: "contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
            layout:"layouts/MDBLayout",
        });
    }
};


exports.getCaptcha = (req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
    const p = new captchapng(80, 30, CAPTCHA_NUM);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};


exports.handleSearch=async(req,res)=>{


    const page = +req.query.page || 1;
    const postPerPage = 2;

    try {
        const numberOfPosts = await Blog.find({ status: "public" , $text:{$search:req.body.search}}).countDocuments();

        const posts = await Blog.find({ status: "public", $text:{$search:req.body.search} })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


        res.render("firstPage", {
            pageTitle: "نتایج جستجوی شما",
            path: "/",
            posts,
            layout:"layouts/MDBLayout",
            formatDate,
            truncate, 
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
         
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500",{pageTitle:"خطا", path:"error"});

    }
};

