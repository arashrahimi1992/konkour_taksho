const mongoose=require('mongoose');


//yup validation
const{adminSchema}=require("./secure/adminValidation");

const schema=new mongoose.Schema({

    adminName:{type:String,required:true,trim:true,},
    adminLastName:{type:String,required:true,trim:true,},
    adminPassword:{type:String,required:true,minlength:4,maxlength:255,},
    adminPhone:{type:Number,default:0,},
    adminEmail:{type:String,required:true,unique:true,},
    adminRole:{type:Boolean,default:false},
    adminCreateAt:{type:Date,default:Date.now,},

});

schema.statics.adminValidation= function (body) {
    return adminSchema.validate(body, { abortEarly: false });
};

const  adminModel=mongoose.model("Admin",schema);

module.exports = adminModel;




