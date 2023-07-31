const {Router}=require('express');
const router=new Router();
const consultantModel =require('../models/consultant');
const contactModel=require('../models/contact');
const productModel=require('../models/product');
const Blog = require("../models/Blog");
const Yup=require('yup');
const captchapng = require("captchapng");
const { formatDate } = require("../utils/jalali");
const { truncate } = require("../utils/helpers");

const userModel=require('../models/user');

const bcrypt=require('bcryptjs');
const passport=require('passport');
let CAPTCHA_NUM;


//--------------------------------------------------------------------------------------
router.get("/contact",(req,res)=>{
         res.render("./AAflexor/UI/contact.ejs",{
         path:"/contact",
         pageTitle:"تماس با ما",
         message:req.flash("success_msg"),
         error:req.flash("error"),
         layout: "./layouts/flexorLayout.ejs",
         errors:[],
     });
});

//numeric captcha
router.get("/captcha.png",(req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
    const p = new captchapng(80, 30, CAPTCHA_NUM);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");
console.log(CAPTCHA_NUM )
    res.send(imgBase64);
}

);
//---------------------------------------------------------------------------------------
router.post("/contact", async (req,res) =>{


    const errorArr = [];
    const { fullname, email, message, captcha } = req.body;

    console.log(captcha)

    const schema = Yup.object().shape({
        fullname: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
        email: Yup.string()
        .email("آدرس ایمیل صحیح نیست")
        .required("آدرس ایمیل الزامی می باشد"),
        message: Yup.string().required("پیام اصلی الزامی می باشد"),
    });

    try {
        await schema.validate(req.body, { abortEarly: false });

        if (parseInt(captcha) === CAPTCHA_NUM) {
            await contactModel.create({ fullname,email,message });
            req.flash("success_msg", "پیام شما با موفقیت ارسال شد");
            return res.render("./AAflexor/UI/contact.ejs", {
                pageTitle: "تماس با ما",
                path: "/contact",
                message: req.flash("success_msg"),
                error: req.flash("error"),
                errors: errorArr,            
                layout:"layouts/flexorLayout",
            });
        }

        req.flash("error", "کد امنیتی صحیح نیست");

        res.render("./AAflexor/UI/contact.ejs", {
            pageTitle: "تماس با ما",
            path: "/contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
            layout:"layouts/flexorLayout",
        });
    }catch(err){
        err.inner.forEach((e)=>{
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("./AAflexor/UI/contact.ejs", {
            pageTitle: "تماس با ما",
            path: "/contact",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr,
            layout:"layouts/flexorLayout",
        });
    }
});

 //-------------------------------------------------------------------------------------------------------   
router.get("/consultant", async(req,res)=>{


    const consultants = await consultantModel.find({});
    console.log(consultants)
         res.render("./AAflexor/UI/consultant.ejs",{
         path:"/getConsultant",
         pageTitle:"دریافت لیست مشاوران",
         consultants,
         layout: "./layouts/flexorLayout.ejs",
     });
});
router.get("/consultantR", async(req,res)=>{
    const consultants = await consultantModel.find({consultantCategory: 1});
         res.render("./AAflexor/UI/consultantR.ejs",{
         path:"/getConsultant",
         pageTitle:"دریافت لیست مشاوران",
         consultants,
         layout: "./layouts/flexorLayout.ejs",
     });
});
router.get("/consultantT", async(req,res)=>{
    const consultants = await consultantModel.find({consultantCategory: 2});
    console.log(consultants)
         res.render("./AAflexor/UI/consultantT.ejs",{
         path:"/getConsultant",
         pageTitle:"دریافت لیست مشاوران",
         consultants,
         layout: "./layouts/flexorLayout.ejs",
     });
});
router.get("/consultantE", async(req,res)=>{
    const consultants = await consultantModel.find({consultantCategory: 3});
    console.log(consultants)
         res.render("./AAflexor/UI/consultantE.ejs",{
         path:"/getConsultant",
         pageTitle:"دریافت لیست مشاوران",
         consultants,
         layout: "./layouts/flexorLayout.ejs",
     });
});
router.get("/consultant/:id", async(req,res)=>{


    const consultant = await consultantModel.findOne({ _id: req.params.id});
    console.log(consultant)
         res.render("./AAflexor/UI/consultantProtofolio.ejs",{
         path:"/getConsultant",
         pageTitle:"جزئیات اطلاعات مشاور",
         consultant,
         layout: "./layouts/flexorLayout.ejs",
     });
});
//----------------------------------------contact---------------------------------------------------------------
router.get("/posts",async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 2;

    try {

      
            const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
            const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
            const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
            const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
            const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


            const numberOfPosts = await Blog.find({ status: "public" }).countDocuments();

            const posts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(8);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/posts.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
}
);
router.get("/anyposts",async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 4;

    try {

      
            const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
            const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
            const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
            const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
            const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


            const numberOfPosts = await Blog.find({ status: "public",category:"any" }).countDocuments();

            const posts = await Blog.find({ status: "public",category:"any" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(8);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/anyposts.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
}
);
router.get("/planningposts",async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 4;

    try {

      
            const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
            const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
            const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
            const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
            const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


            const numberOfPosts = await Blog.find({ status: "public",category:"planning" }).countDocuments();

            const posts = await Blog.find({ status: "public",category:"planning" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(8);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/planningposts.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
}
);
router.get("/Motivationposts",async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 4;

    try {

      
            const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
            const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
            const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
            const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
            const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


            const numberOfPosts = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();

            const posts = await Blog.find({ status: "public",category:"Motivation" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(8);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/Motivationposts.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
}
);
router.get("/newsposts",async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 4;

    try {

      
            const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
            const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
            const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
            const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
            const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


            const numberOfPosts = await Blog.find({ status: "public",category:"news" }).countDocuments();

            const posts = await Blog.find({ status: "public",category:"news" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(5);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/newsposts.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
}
);
router.get("/educationalposts",async (req, res) => {

    const page = +req.query.page || 1;
    const postPerPage = 4;

    try {

      
            const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
            const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
            const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
            const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
            const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


            const numberOfPosts = await Blog.find({ status: "public",category:"educational" }).countDocuments();

            const posts = await Blog.find({ status: "public",category:"educational" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(5);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/educationalposts.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
}
);
router.get("/posts/:id",async (req, res) => {
    try {

        const post = await Blog.findOne({ _id: req.params.id }).populate( "user" );
console.log(post)
        if (!post) return res.redirect("errors/404");

        res.render("../views/AAflexor/UI/singlepost.ejs", {
            pageTitle: post.title,
            path: "/post",
            post,
            layout:"layouts/flexorLayout",
            formatDate,
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500",{pageTitle:"خطا",path:"error"});
    }
});

router.get("/", (req,res)=>{res.render("./AAflexor/UI/index.ejs",
{
    layout:"./layouts/flexorLayout.ejs",

})});

router.get("/register",(req,res)=>{ 
   res.render("../views/AAflexor/UI/userRegister.ejs",{ 
   pageTitle:"ثبت نام کاربر", 
   layout:"./layouts/flexorLayout",
});
});

router.post("/register",async(req,res)=>{
   const errors=[];
   console.log(req.body)
       try{
       console.log(req.body)

           await userModel.userValidation(req.body);
           const {userName,userLastName,userPhone,userEmail,userPassword} = req.body;
           const user = await userModel.findOne({ userEmail });
           if (user) {
               errors.push({ message: "کاربری با این ایمیل موجود است" });
               return res.render("../views/AAflexor/UI/userRegister.ejs", 
               {
                   pageTitle: "ثبت نام کاربر",
                   path: "/userRegister",
                   errors,
                   layout:"./layouts/flexorLayout",

               });
           }else{
           //no thing
           }  
       const hash = await bcrypt.hash(userPassword, 10);
       await userModel.create({  userName, userLastName, userPhone, userEmail,userPassword});
        req.flash("success_msg", "ثبت نام موفقیت آمیز بود.");
       res.redirect("/taksho/login");
   
       }
       catch(err){
           err.inner.forEach(e =>{
           errors.push({
           name:e.path,
           message:e.message,
           });
       });

       return res.render("../views/AAflexor/UI/userRegister.ejs",{
           pageTitle:"ثبت نام",
           path:"/userRegister",
           layout:"layouts/flexorLayout",
           errors,
       })
}});

router.get("/login",(req,res)=>{
   res.render("../views/AAflexor/UI/userLogin.ejs",{ 
   pageTitle:"صفحه نخست", 
   layout:"./layouts/flexorLayout",
   message: req.flash("success_msg"),
   error:req.flash("error"),
   });
});

router.get("/st-Planning",(req,res)=>{
    res.render("../views/AAflexor/UI/staticplanning.ejs",{ 
    pageTitle:"صفحه نخست", 
    layout:"./layouts/flexorLayout",
    message: req.flash("success_msg"),
    error:req.flash("error"),
    });
 });

 router.get("/st-Planning1",(req,res)=>{
    res.render("../views/AAflexor/UI/staticplanning1.ejs",{ 
    pageTitle:"صفحه نخست", 
    layout:"./layouts/flexorLayout",
    message: req.flash("success_msg"),
    error:req.flash("error"),
    });
 });

 router.get("/st-Planning2",(req,res)=>{
    res.render("../views/AAflexor/UI/staticplanning2.ejs",{ 
    pageTitle:"صفحه نخست", 
    layout:"./layouts/flexorLayout",
    message: req.flash("success_msg"),
    error:req.flash("error"),
    });
 });



// router.post("/login",async (req, res, next) => {
//     console.log("captch",req.body["g-recaptcha-response"]);
//     if(!req.body["g-recaptcha-response"]){
//         req.flash("error","اعتبار سنجی الزامی میباشد");
//         return res.redirect("/taksho/login");
//     }
    
//     const secretKey=process.env.CAPTCHA_SECRET;
//     const verifyUrl=  `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`
//     const response = await fetch(verifyUrl, {
//         method: "POST",
//         headers: {
//             Accept: "application/json",
//             "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//         },
//     });
    
//     const json = await response.json();
//     console.log(json);
    
//     if (json.success) {
//         passport.authenticate("local", {
//             failureRedirect: "/taksho/login",
//             failureFlash: true,
//         })(req, res, next);
//     } 
//     else 
//     {
//         req.flash("error", "مشکلی در اعتبارسنجی captcha هست");
//         res.redirect("/taksho/login");
//     }
//         });

router.post("/login",async (req,res) => {

try{
   const {userEmail,userPassword} = req.body;
   const user = await userModel.findOne({ userEmail });

   if(!user){

    res.redirect("/taksho/login");

   }
   else

{  
    if(userPassword == user.userPassword)
    {

        res.redirect("/taksho");
        
    }

    else
    {
        res.redirect("/taksho/login");
    }
}
//   const hash = await bcrypt.hash(userPassword, 10);
   
  
} catch(err){
   console.log(err);
}

});
       
router.get("/aboutus",(req,res)=>{ 
    res.render("../views/AAflexor/UI/aboutus.ejs",{ 
    pageTitle:"درباره ما", 
    layout:"./layouts/flexorLayout",
 });
 });

router.get("/products", async (req, res) => {
 
     const page = +req.query.page || 1;
     const postPerPage =6;
 
     try {
         const numberOfProducts = await productModel.find({ }).countDocuments();
 
         const products = await productModel.find({ })
             .sort({
                 createdAt: "desc",
             })
             .skip((page - 1) * postPerPage)
             .limit(postPerPage);
 
 
         res.render("../views/AAflexor/UI/products.ejs", {
             pageTitle: " گروه آموزشی کنکور تکشو",
             path: "/",
             products,
             layout:"layouts/flexorLayout",
             formatDate,
             truncate, 
             currentPage: page,
             nextPage: page + 1,
             previousPage: page - 1,
             hasNextPage: postPerPage * page < numberOfProducts,
             hasPreviousPage: page > 1,
             lastPage: Math.ceil(numberOfProducts / postPerPage),
          
         });
     } catch (err) {
         console.log(err);
         res.render("errors/500",{pageTitle:"خطا", path:"error"});
 
     }
 }
 );

 router.get("/availableProduct", async(req,res)=>{
 
    const page = +req.query.page || 1;
    const postPerPage =6;

    try {
        const numberOfProducts = await productModel.find({productAvailable:"1" }).countDocuments();

        const products = await productModel.find({productAvailable:"1" })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


        res.render("../views/AAflexor/UI/products.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            products,
            layout:"layouts/flexorLayout",
            formatDate,
            truncate, 
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfProducts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfProducts / postPerPage),
         
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500",{pageTitle:"خطا", path:"error"});

    }
}
);

router.get("/cat1Product", async(req,res)=>{
 
    const page = +req.query.page || 1;
    const postPerPage =6;

    try {
        const numberOfProducts = await productModel.find({productCategory:1 }).countDocuments();

        const products = await productModel.find({productCategory:1 })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);


        res.render("../views/AAflexor/UI/products.ejs", {
            pageTitle: " گروه آموزشی کنکور تکشو",
            path: "/",
            products,
            layout:"layouts/flexorLayout",
            formatDate,
            truncate, 
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfProducts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfProducts / postPerPage),
         
        });
    } catch (err) {
        console.log(err);
        res.render("errors/500",{pageTitle:"خطا", path:"error"});

    }
}
);

router.get("/newProduct", async(req,res)=>{
    const products = await productModel.find({ productAvailable:"1" });
    console.log(products)
         res.render("../views/AAflexor/UI/products.ejs",{
         path:"/getproduct",
         pageTitle:"دریافت لیست مشاوران",
         products,
         layout: "./layouts/flexorLayout.ejs",
     });
});

router.get("/products/:id", async(req,res)=>{


    const product = await productModel.findOne({ _id: req.params.id});
    console.log(product)
         res.render("../views/AAflexor/UI/productProtofolio.ejs",{
         path:"/getConsultant",
         pageTitle:"جزئیات اطلاعات مشاور",
         product,
         layout: "./layouts/flexorLayout.ejs",
     });
});

router.get("/single", async(req,res)=>{

         res.render("../views/AAflexor/UI/single.ejs",{
         path:"/getproduct",
         pageTitle:"دریافت لیست مشاوران",
         layout: "./layouts/flexorLayout.ejs",
     });
});

router.get("/team", async(req,res)=>{

    res.render("../views/AAflexor/UI/team.ejs",{
    path:"/getproduct",
    pageTitle:"دریافت لیست مشاوران",
    layout: "./layouts/flexorLayout.ejs",
});
});

router.get("/private", async(req,res)=>{

    res.render("../views/AAflexor/UI/private.ejs",{
    path:"/getproduct",
    pageTitle:"دریافت لیست مشاوران",
    layout: "./layouts/flexorLayout.ejs",
});
});

router.post("/search",async (req, res) => {
    const page = +req.query.page || 1;
    const postPerPage = 2;

    try {


        const any = await Blog.find({ status: "public",category:"any" }).countDocuments();
        const planning = await Blog.find({ status: "public",category:"planning" }).countDocuments();
        const Motivation = await Blog.find({ status: "public",category:"Motivation" }).countDocuments();
        const news = await Blog.find({ status: "public",category:"news" }).countDocuments();
        const educational = await Blog.find({ status: "public",category:"educational" }).countDocuments();


        const numberOfPosts = await Blog.find({
            status: "public",
            $text: { $search: req.body.search },
        }).countDocuments();

        const posts = await Blog.find({
            status: "public",
            $text: { $search: req.body.search },
        })
            .sort({
                createdAt: "desc",
            })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);



            const recentposts = await Blog.find({ status: "public" })
            .sort({
                createdAt: "desc",
            }).limit(8);

            console.log(recentposts);


        res.render("../views/AAflexor/UI/posts.ejs", {
            pageTitle: "نتایج جستجوی شما",
            path: "/",
            posts,
            recentposts,
            planning, 
            Motivation,
            news,
            educational,
            any,
            layout:"layouts/flexorLayout",
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
        res.render("errors/500", {
            pageTitle: "خطای سرور | 500",
            path: "/404",
        });
    }
});


 module.exports=router;