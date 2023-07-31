const {Router} = require('express');
const router = new Router();
const {authenticated} = require("../middlewares/auth");
const dashboardController = require('../controllers/dashboardController');
const {formatDate} = require("../utils/jalali");



//-post---------------------------------------------------------------------------
router.get("/add-post", authenticated, dashboardController.getAddPost);
router.post("/add-post", authenticated, dashboardController.createPost);
router.get("/edit-post/:id", authenticated, dashboardController.getEditPost);
router.post("/edit-post/:id", authenticated, dashboardController.editPost);
router.get("/delete-post/:id", authenticated, dashboardController.deletePost);
router.post("/image-upload", authenticated, dashboardController.uploadImage);


//-search----------------------------------------------------------------------------
router.post("/search", authenticated, dashboardController.handleDashSearch);


//-admin-----------------------------------------------------------------------------
router.get("/getAdmin", authenticated, dashboardController.getAdmin);
router.get("/editAdmin/:id", authenticated, dashboardController.editAdmin);
router.get("/deleteAdmin/:id", authenticated, authenticated, dashboardController.deleteAdmin);
router.get("/register", authenticated, dashboardController.register);
router.post("/register", authenticated, dashboardController.handleRegister);


//-consultant-------------------------------------------------------------------------
router.get("/getConsultant", authenticated, dashboardController.getConsultant);
router.get("/consultantRegister", authenticated, dashboardController.consultantRegister);
router.post("/consultantRegister", authenticated, dashboardController.consultantHandleRegister);
router.get("/deleteConsultant/:id", authenticated, dashboardController.deleteConsultant);
router.get("/editConsultant/:id", authenticated, dashboardController.editConsultant);
router.post("/editConsultant/:id", authenticated, dashboardController.edithandleConsultant);


//-------------------------------------------------------------------------------------
router.post("/addProduct", authenticated, dashboardController.addProduct);
router.get("/addProduct", authenticated, dashboardController.handleaddProduct);
router.get("/getProduct", authenticated, dashboardController.getProduct);

// router.post("/addProduct",authenticated,dashboardController.addProduct);
//-------------------------------------------------------------------------------------
// router.get("/getProduct",authenticated,dashboardController.getProduct);

router.post("/editProduct/:id", authenticated, dashboardController.edithandleProduct);
router.get("/editProduct/:id", authenticated, dashboardController.editProduct);
router.get("/deleteProduct/:id", authenticated, dashboardController.deleteProduct);
//  //-exports-----------------------------------------------------------------------------
router.get("/", authenticated, dashboardController.getDashboard);

module.exports = router;