const {
    Router
} = require('express');
const router = new Router();

const adminController = require('../controllers/adminControllers');
const {
    authenticated
} = require("../middlewares/auth");


// get admin login
router.get("/loginAdmin", adminController.login);

//  @desc   Login Handle
//  @route  POST /users/login
router.post("/loginAdmin", adminController.handleLogin, adminController.rememberMe);

//logout get
router.get("/logoutAdmin", authenticated, adminController.logout)

// // get admin register
// router.get("/registerAdmin",adminController.register);

// // post admin handleregister
// router.post("/registerAdmin",adminController.handleRegister);

//  @desc   Forget Password Page
//  @route  GET /users/forget-password
router.get("/forget-password", adminController.forgetPasswrod);

//  @desc   Handle Forget Password
//  @route  POST /users/forget-password
router.post("/forget-password", adminController.handleForgetPassword);

//  @desc   Handle reset Password
//  @route  POST /users/reset-password/:id
router.post("/reset-password/:id", adminController.handleResetPassword);


router.get("/reset-password/:token", adminController.resetPassword);


// exports
module.exports = router;