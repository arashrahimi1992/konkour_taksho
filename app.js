const path=require('path');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const MongoStore=require("connect-mongo");
const mongoose=require('mongoose');
const debug=require("debug")("x");
const fileUpload = require("express-fileupload");
//-------------------------------------------------------------
const express=require('express');
const expresseLayout=require('express-ejs-layouts');
const morgan=require('morgan');
require('ejs');
const { urlencoded } = require('express');
//-------------------------------------------------------------

//!connect DB
const connectDB=require('./config/db');

//!winston
//const winston=require("./config/winston");

//!load config: npm i dotenv and create config.env in the config and... 55
require('dotenv').config({path:"./config/confg.env"});


const app=express();

//!connect DB
connectDB();

//!passport config
require("./config/passport");
require("./config/passportUser");




//!urlencoded
app.use(express.urlencoded({extended:false}));
app.use(express.json());


//* File Upload Middleware
app.use(fileUpload());

//* Session
app.use( 
    session({
        secret: process.env.SESSION_SECRET,
        //cookie: { maxAge: null },
        resave: false,
        unset:"destroy",
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/consultant_db' })
    })
);


//passport init
app.use(passport.initialize());
app.use(passport.session());


//* Flash
app.use(flash()); //req.flash

//!logging 56
// if(process.env.NODE_ENV === "development"){
//     debug("Morgan Enabled");
//     app.use(morgan("combined",{ stream : winston.stream}))}

//! set view engine 
app.use(expresseLayout);
app.set("layout","./layouts/mainLayout");
app.set("view engine","ejs");
app.set("views","views");

//! set statics 
app.use(express.static(path.join(__dirname,"public")));

app.use("/taksho",require('./routes/flexor'));
app.use("/",require('./routes/flexor'));
app.use("/admin",require('./routes/admin'));
app.use("/dashboard",require('./routes/dashboard'));
app.use("/user",require('./routes/UserRoutes'));
//404
app.use((req,res)=>{
res.render("./errors/404.ejs",{pageTitle:"صفحه پیدا نشد ",path:"/404"})
})

//!listen 54
const port=process.env.PORT ||5000 //55
app.listen(port,()=>{console.log(`server listen in port "${port}" and "${process.env.NODE_ENV}" state`);})