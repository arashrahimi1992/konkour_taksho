const multer = require("multer");
const router = require('express').Router();

const userController = require('../controllers/UserController');

// const Auth = require("../http/middleware/Auth")

router.post('/login', userController.login);
router.post('/register', userController.register);



module.exports = router;
