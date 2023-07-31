const mongoose=require('mongoose');


//yup validation
const{contactSchema}=require("./secure/contactValidation");

const schema=new mongoose.Schema({

    fullname:{type:String,required:true,trim:true,},
    message:{type:String,required:true,minlength:3,maxlength:1000,},
    email:{type:String,required:true},
   

});

schema.statics.contactValidation= function (body) {
    return contactSchema.validate(body, { abortEarly: false });
};

const  contactModel=mongoose.model("Contact",schema);

module.exports = contactModel;




