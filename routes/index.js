const {Router}=require('express');
const router=new Router();
const { authenticated } = require("../middlewares/auth");
const blogController=require('../controllers/blogController');




router.get("/",blogController.getIndex)
    
//  @desc   Weblog Post Page
//  @route  GET /post/:id
router.get("/post/:id", blogController.getSinglePost);

//  @desc   Weblog Contact Page
//  @route  GET /contact
// router.get("/contact", blogController.getContactPage);

// //  @desc   Handle Contact Page
// //  @route  POST /contact
// router.post("/contact", blogController.handleContactPage);


// //  @desc   Weblog Numric Captcha
// //  @route  GET /captcha.png
// router.get("/captcha.png", blogController.getCaptcha);


//  @desc   Handle Search
//  @route  POST /search
router.post("/search", blogController.handleSearch);
 //exports
 module.exports=router;