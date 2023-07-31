const bcrypt=require('bcryptjs');
const adminModel=require('../models/admin');
const consultantModel=require('../models/consultant');
const productModel=require('../models/product');
const passport=require('passport');
const fetch=require('node-fetch');
const {formatDate}=require('../utils/jalali');
const { fileFilter } = require("../utils/multer");
const shortId = require("shortid");
const multer = require("multer");
const appRoot = require("app-root-path");
const uuid = require("uuid").v4;
const sharp = require("sharp");
const Blog=require('../models/Blog');
const fs = require("fs");





exports.getDashboard=async (req,res)=>{

    const page = +req.query.page || 1;
    const postPerPage = 3;

    let blogs;
    try{

        const numberOfPosts = await Blog.find({
            user: req.user._id,
        }).countDocuments();

        if(req.user.adminEmail==process.env.privateEmail)
        blogs=await Blog.find().skip((page - 1) * postPerPage)
        .limit(postPerPage);
        else
        blogs=await Blog.find({user:req.user.id}).skip((page - 1) * postPerPage)
        .limit(postPerPage);
 await Blog.where
        res.render("../views/adminViews/blogs.ejs",{
        pageTitle:"داشبورد|  بخش مدیریت  ",
        path:"/dashboard",
        layout:"layouts/dashLayout",
        name:req.user.adminName,
        blogs,
        formatDate,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: postPerPage * page < numberOfPosts,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(numberOfPosts / postPerPage),
    });

    }
    catch(err){
      console.log(err);
      res.render("../views/errors/500.ejs",{
          pageTitle:"خطای سرور |500",
          path:"/404",
          
      })
    }
};

exports.getAddPost = (req, res) => {
        res.render("./adminViews/addPost.ejs", {
            pageTitle: "بخش مدیریت | ساخت پست جدید",
            path: "/dashboard/add-post",
            layout: "./layouts/dashLayout",
            name:req.user.adminName
        });
};

exports.createPost = async (req, res) => {

        const errorArr = [];
        const thumbnail = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnail.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    
        console.log(thumbnail);
    
        try {
            req.body = { ...req.body, thumbnail };
    
            console.log(req.body);
    
            await Blog.postValidation(req.body);
    
            await sharp(thumbnail.data)
                .jpeg({ quality: 60 })
                .toFile(uploadPath)
                .catch((err) => console.log(err));
    
            await Blog.create({
                ...req.body,
                user: req.user.id,
                thumbnail: fileName,
            });
            res.redirect("/dashboard");
        } catch (err) {
            console.log(err);
            err.inner.forEach((e) => {
                errorArr.push({
                    name: e.path,
                    message: e.message,
                });
            });
            res.render("./adminViews/addPost.ejs", {
                pageTitle: "بخش مدیریت | ساخت پست جدید",
                path: "/dashboard/add-post",
                layout: "./layouts/dashLayout",
               name: req.user.fullname,
                errors: errorArr,
            });
        }
};

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
            res.render("private/editPost", {
                pageTitle: "بخش مدیریت | ویرایش پست",
                path: "/dashboard/edit-post",
                layout: "./layouts/dashLayout",
                fullname: req.user.fullname,
                errors: errorArr,
                post,
            });
        }
};

exports.getEditPost = async (req, res) => {
    const post = await Blog.findOne({
        _id: req.params.id,
    });

    if (!post) {
        return res.redirect("errors/404");
    }

    if (post.user.toString() != req.user._id && post.user.toString() != "60b67bab1c833c2694e2646c" ) {
        return res.redirect("/dashboard");
    } else {
        res.render("adminViews/editPost", {
            pageTitle: "بخش مدیریت | ویرایش پست",
            path: "/dashboard/edit-post",
            layout: "./layouts/dashLayout",
            name: req.user.fullname,
            post,
        });
    }
};

exports.deletePost = async (req, res) => {
    try 
    {
        const result = await Blog.findByIdAndRemove(req.params.id);
        console.log(result);
        res.redirect("/dashboard");
    } 
    catch (err) 
    {
        console.log(err);
        res.render("errors/500");
    }
};

exports.uploadImage = (req, res) => {
    const upload = multer({
        limits: { fileSize: 4000000 },
        // dest: "uploads/",
        // storage: storage,
        fileFilter: fileFilter,
    }).single("image");
    
    //req.file
    // console.log(req.file)

    upload(req, res, async (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res
                    .status(400)
                    .send("حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد");
            }
            res.status(400).send(err);
        } else {
            if (req.file) {
                const fileName = `${shortId.generate()}_${
                    req.file.originalname
                }`;
                await sharp(req.file.buffer)
                    .jpeg({
                        quality: 60,
                    })
                    .toFile(`./public/uploads/${fileName}`)
                    .catch((err) => console.log(err));
                // res.json({"message" : "", "address" : ""});
                res.status(200).send(
                    `http://localhost:3000/uploads/${fileName}`
                );
            } else {
                res.send("جهت آپلود باید عکسی انتخاب کنید");
            }
        }
    });
};

// exports.handleSearch = async (req, res) => {
//     const page = +req.query.page || 1;
//     const postPerPage = 5;

//     try {
//         const numberOfPosts = await Blog.find({
//             status: "public",
//             $text: { $search: req.body.search },
//         }).countDocuments();

//         const posts = await Blog.find({
//             status: "public",
//             $text: { $search: req.body.search },
//         })
//             .sort({
//                 createdAt: "desc",
//             })
//             .skip((page - 1) * postPerPage)
//             .limit(postPerPage);

//         res.render("index", {
//             pageTitle: "نتایج جستجوی شما",
//             path: "/",
//             posts,
//             formatDate,
//             truncate,
//             currentPage: page,
//             nextPage: page + 1,
//             previousPage: page - 1,
//             hasNextPage: postPerPage * page < numberOfPosts,
//             hasPreviousPage: page > 1,
//             lastPage: Math.ceil(numberOfPosts / postPerPage),
//         });
//         //? Smooth Scrolling
//     } catch (err) {
//         console.log(err);
//         res.render("errors/500", {
//             pageTitle: "خطای سرور | 500",
//             path: "/404",
//         });
//     }
// };

exports.handleDashSearch = async (req, res) => {
    const page = +req.query.page || 1;
    const postPerPage = 2;

    try {
        const numberOfPosts = await Blog.find({
            user: req.user._id,
            $text: { $search: req.body.search },
        }).countDocuments();
        const blogs = await Blog.find({
            user: req.user.id,
            $text: { $search: req.body.search },
        })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);

        res.render("../views/adminViews/blogs.ejs", {
            pageTitle: "بخش مدیریت | داشبورد",
            path: "/dashboard",
            layout: "./layouts/dashLayout",
            name: req.user.adminName,
            blogs,
            formatDate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
};

exports.getAdmin=async (req,res)=>{
    
    const admins = await adminModel.find({});
    res.render("./adminViews/getAdmin.ejs",{
        path:"/getAdmin",
        pageTitle:"دریافت لیست ادمین ها",
        admins,
        formatDate,   
        layout: "./layouts/dashLayout",
        name:"ادمین"
    
    });
    
};

exports.editAdmin=async(req,res)=>{

const admin = await adminModel.findOne({ _id: req.params.id });
// console.log("param",req.params);
// console.log("admin",admin)
// console.log("adminRole",admin.adminRole)

    if(admin.adminRole==false)
       {admin.adminRole=true}
    else
       {admin.adminRole=false}

    admin.save();
    res.redirect("/dashboard/getAdmin");

};

exports.deleteAdmin=async(req,res)=>{

    try{   

    const admin= await adminModel.findOne({ _id: req.params.id });
    if(admin.adminEmail==process.env.privateEmail)
    {      
        res.redirect("/dashboard/getAdmin");
    }

     await adminModel.findOneAndRemove({ _id: req.params.id });
     res.redirect("/dashboard/getAdmin");
    }
    catch(err)
    {
      console.log(err);
    }

  

};

exports.register=(req,res)=>{

    res.render("../views/dashboard/registerAdmin.ejs",
    {
    pageTitle:"پیش ثبت نام در بخش مدیریت",
    path:"/registerAdmin",
    layout:"layouts/dashLayout",
    name:"admin"
    });

}

exports.handleRegister=async(req,res)=>{
    const errors=[];
        try{

            console.log(req.body);
            await adminModel.adminValidation(req.body);
            const {adminName,adminLastName,adminPhone,adminEmail,adminPassword} = req.body;
            const admin = await adminModel.findOne({ adminEmail });
            if (admin) {
                errors.push({ message: "کاربری با این ایمیل موجود است" });
                return res.render("../views/dashboard/registerAdmin.ejs", 
                {
                    pageTitle: "ثبت نام کاربر",
                    path: "/registerAdmin",
                    errors,
                });

            }else{ }  

        const hash = await bcrypt.hash(adminPassword, 10);
        await adminModel.create({  adminName, adminLastName, adminPhone, adminEmail, adminPassword:hash });
        req.flash("success_msg", "ثبت نام موفقیت آمیز بود.");
        res.redirect("/dashboard/getAdmin");
        }
        catch(err){
           console.log(err)
            err.inner.forEach(e => {
            errors.push({
            name:e.path,
            message:e.message,
            });
        });

        return res.render("../views/dashboard/registerAdmin.ejs",{
            pageTitle:"ثبت نام",
            path:"/registerAdmin",
            layout:"layouts/dashLayout",
            errors,
            name:"ادمین",
        })
}};

exports.consultantRegister=async(req,res)=>{

    res.render("../views/dashboard/consultantRegister.ejs",
    {
    pageTitle:"ثبت مشاور جدید",
    path:"/registerAdmin",
    layout:"layouts/dashLayout",
    name:"admin"
    });

}

exports.consultantHandleRegister=async(req,res)=>{
//--------------------

//--------------------
    const errors=[];


    try{
        const thumbnails = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnails.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
       
        console.log("body:",req.body);
        console.log("thumbnail:",thumbnails);
        await consultantModel.consultantValidation({...req.body,thumbnails});


        
        await sharp(thumbnails.data)
        .jpeg({ quality: 60 })
        .toFile(uploadPath)
        .catch((err) => console.log(err));

        const {
            consultantName,
            consultantLastName,
            consultantPassword,
            consultantPhone,
            consultantEmail,
            consultantUniversity,
            consultantRank,
            consultantZone,
            consultantYear,
            consultantField,
            consultantContent,
            consultantCategory,
 
            } =req.body;

         
        const consultant = await consultantModel.findOne({ consultantEmail });

        if (consultant) {
            errors.push({ message: "کاربری با این ایمیل موجود است" });
            return res.render("../views/dashboard/consultantRegister.ejs", 
            {
                pageTitle: "ثبت نام کاربر",
                path: "/registerConsultant",
                errors,
            });

        }else{ }  

    const hash = await bcrypt.hash(consultantPassword, 10);
    await consultantModel.create({   

        consultantName,
        consultantLastName,
        consultantPassword:hash,
        consultantPhone,
        consultantEmail,
        consultantUniversity,
        consultantRank,
        consultantZone,
        consultantYear,
        consultantField,
        consultantContent,
        consultantCategory, 
        consultantthumbnail: fileName,
    });

    // req.flash("success_msg", "ثبت نام موفقیت آمیز بود.");
    res.redirect("/dashboard");

    }
    catch(err){

        console.log(err);
        err.inner.forEach(e => {
        errors.push({
        name:e.path,
        message:e.message,
        });
    });

    return res.render("../views/dashboard/consultantRegister.ejs",{
        pageTitle:"ثبت نام",
        path:"/registerConsultant",
        layout:"layouts/dashLayout",
        errors,
        name:"admin",
    })
}

}

// exports.createPost = async(req, res) => {
//     const errorArr = [];
//     try {
//         await Blog.postValidation(req.body);
//         await Blog.create({ ...req.body, user: req.user.id });
//         res.redirect("/dashboard");
//     } catch (err) {
//         console.log(err);
//         err.inner.forEach((e) => {
//             errorArr.push({
//                 name: e.path,
//                 message: e.message,
//             });
//         });
//         res.render("./adminViews/addPost.ejs", {
//             pageTitle: "بخش مدیریت | ساخت پست جدید",
//             path: "/dashboard/add-post",
//             layout: "./layouts/dashLayout",
//            name: req.user.fullname,
//             errors: errorArr,
//         });
//     }
// };
//-------------get-editPost-----------------------------------------------------------------

// exports.editPost = async (req, res) => {
//     const errorArr = [];

//     const post = await Blog.findOne({ _id: req.params.id });
//     try {
//         await Blog.postValidation(req.body);

//         if (!post) {
//             return res.redirect("errors/404");
//         }

//         if (post.user.toString() != req.user._id) {
//             return res.redirect("/dashboard");
//         } else {
//             const { title, status, body } = req.body;
//             post.title = title;
//             post.status = status;
//             post.body = body;

//             await post.save();
//             return res.redirect("/dashboard");
//         }
//     } catch (err) {
//         console.log(err);
//         err.inner.forEach((e) => {
//             errorArr.push({
//                 name: e.path,
//                 message: e.message,
//             });
//         });
//         res.render("adminViews/editPost", {
//             pageTitle: "بخش مدیریت | ویرایش پست",
//             path: "/dashboard/edit-post",
//             layout: "./layouts/dashLayout",
//             name: req.user.fullname,
//             errors: errorArr,
//             post,
//         });
//     }
// };
//------------------------------------------------------------------------


exports.getConsultant=async(req,res)=>{


    const consultants = await consultantModel.find({});
    //console.log(admins)
     res.render("./adminViews/getConsultant.ejs",{
         path:"/getConsultant",
         pageTitle:"دریافت لیست مشاوران",
         consultants,
         formatDate,   
         layout: "./layouts/dashLayout",
         name:"ادمین"
     
     });
}

exports.deleteConsultant=async(req,res)=>{

    await consultantModel.findOneAndRemove({ _id: req.params.id });
    res.redirect("/dashboard/getconsultant");
 
};

 exports.editConsultant=async(req,res)=>{


    try{
        const consultant = await consultantModel.findOne({ _id: req.params.id });

  
        if(consultant){
    
            res.render("./dashboard/consultantEdit.ejs",{
                path:"/ConsultantEdit",
                pageTitle:"ویرایش مشاور",
                consultant,
                layout: "./layouts/dashLayout",
                name:"ادمین"
            
            });
        }
        else{
            console.log("مشاوری بااین مشخصات پیدا نشد");
        }

    }
    catch(err){
        console.log(err);
    }

};

 exports.edithandleConsultant= async(req, res)=> {
    const errorArr = [];


    try { 
        const consultant = await consultantModel.findOne({ _id: req.params.id });

        const thumbnails = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnails.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

        if (!consultant){
            return res.redirect("errors/404");
        }

        console.log(consultant);
        await consultantModel.consultantValidation({...req.body,thumbnails});

            
        await sharp(thumbnails.data)
        .jpeg({ quality: 60 })
        .toFile(uploadPath)
        .catch((err) => console.log(err));

            const { 
            consultantName,
            consultantLastName,
            consultantPassword,
            consultantPhone,
            consultantEmail,
            consultantUniversity,
            consultantRank,
            consultantZone,
            consultantYear,
            consultantField,
            consultantContent,
            consultantCategory } = req.body;


            const hash = await bcrypt.hash(consultantPassword, 10);

            consultant.consultantName=consultantName;
            consultant.consultantLastName=consultantLastName;
            consultant.consultantPhone= consultantPhone;
            consultant.consultantPassword=hash,
            consultant.consultantEmail=consultantEmail;
            consultant.consultantUniversity=consultantUniversity;
            consultant.consultantRank=consultantRank;
            consultant.consultantZone=consultantZone;
            consultant.consultantYear= consultantYear;
            consultant.consultantField=consultantField;
            consultant.consultantContent= consultantContent;
            consultant.consultantCategory=consultantCategory;
            consultant.consultantthumbnail= fileName;

 
            consultant.save();
            return res.redirect("/dashboard");
       

    }catch(err){
        err.inner.forEach(e=>{
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        res.render("../views/dashboard/consultantEdit.ejs", {
            pageTitle: "بخش مدیریت | ویرایش پست",
            path: "/dashboard/editConsultant",
            layout: "./layouts/dashLayout",
            name: req.consultantName,
            errors: errorArr,
            consultant,
        });
    }
};

exports.addProduct=async(req,res)=>{


        const errorArr = [];
        const thumbnail = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnail.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    
        console.log(thumbnail);
    
        try {
            req.body = { ...req.body, thumbnail };
    
            console.log(req.body);
    
            await productModel.productValidation(req.body);
    
            await sharp(thumbnail.data)
                .jpeg({ quality: 60 })
                .toFile(uploadPath)
                .catch((err) => console.log(err));
    
            await productModel.create({
                ...req.body,
                productthumbnail: fileName,
            });
            res.redirect("/dashboard");
        } catch (err) {
            console.log(err);
            err.inner.forEach((e) => {
                errorArr.push({
                    name: e.path,
                    message: e.message,
                });
            });
            res.render("./adminViews/addProduct.ejs", {
                pageTitle: "ساخت محصول جدید",
                path: "/dashboard/addProduct",
                layout: "./layouts/dashLayout",
                name:"ادمین",
                errors: errorArr,
            });
        }
}

exports.handleaddProduct=async(req,res)=>{

    res.render("./adminViews/addProduct.ejs", {
        pageTitle: "بخش مدیریت | ساخت محصوب جدید",
        path: "/dashboard/addproduct",
        layout: "./layouts/dashLayout",
        name:"ادمین"
    });

}

exports.getProduct=async (req,res)=>{
    
    const products = await productModel.find({});
    res.render("./adminViews/getProduct.ejs",{
        path:"/getProduct",
        pageTitle:"دریافت لیست محصولات ",
        products,
        formatDate,   
        layout: "./layouts/dashLayout",
        name:"ادمین"
    
    });
    
};

exports.editProduct=async(req,res)=>{


    try{
        const product = await productModel.findOne({ _id: req.params.id });

  
        if(product){
    
            res.render("./adminViews/editProduct.ejs",{
                path:"/ConsultantEdit",
                pageTitle:"ویرایش محصول",
                product,
                layout: "./layouts/dashLayout",
                name:"ادمین"
            
            });
        }
        else{
            console.log("مشاوری بااین مشخصات پیدا نشد");
        }

    }
    catch(err){
        console.log(err);
    }

};

 exports.edithandleProduct=async (req, res) => {


    const errorArr = [];
    const product= await productModel.findOne({ _id: req.params.id });

        const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    try {

        if (!product) {
            return res.redirect("errors/404");
        }

        console.log(product);

        await productModel.productValidation( { ...req.body, thumbnail });
        await sharp(thumbnail.data)
        .jpeg({ quality: 60 })
        .toFile(uploadPath)
        .catch((err) => console.log(err));

        const {productName,productLittleTitle,productPrice,productCount,productOffer,productAvailable,productContent,productCategory}=req.body;
               
        
                product.productName=productName;
                product.productLittleTitle=productLittleTitle;
                product.productPrice=productPrice;
                product.productCount=productCount;
                product.productOffer=productOffer;
                product.productAvailable=productAvailable;
                product.productContent=productContent;
                product.productCategory=productCategory;
                product.productthumbnail=fileName;
        

                console.log(product);
           product.save();
            return res.redirect("/dashboard");
       

    }catch(err){
 
        err.inner.forEach((e)=>{
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });

            res.render("../views/adminViews/editProduct.ejs", {
            pageTitle: "بخش مدیریت | ویرایش پست",
            path: "/dashboard/editConsultant",
            layout: "./layouts/dashLayout",
            name: "m",
            errors: errorArr,
            product,
        });
    }
};
 
exports.deleteProduct = async (req, res) => {
    try 
    {
        const result = await productModel.findByIdAndRemove(req.params.id);
        console.log(result);
        res.redirect("/dashboard/getProduct");
    } 
    catch(err) 
    {
        console.log(err);
        res.render("errors/500");
    }
};

