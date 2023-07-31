const mongoose=require('mongoose');


//yup validation
const{consultantSchema}=require("./secure/consultantValidation");

const schema=new mongoose.Schema({

     consultantName:{type:String,required:true,trim:true,},
     consultantLastName:{type:String,required:true,trim:true,},
     consultantPassword:{type:String,required:true,minlength:6,maxlength:255,},
     consultantPhone:{type:Number},
     consultantEmail:{type:String,required:true,unique:true,},
     consultantCreateAt:{type:Date,default:Date.now,},
     consultantUniversity:{type:String,required:true,},
     consultantRank:{type:Number,required:true},
     consultantZone:{type:Number,required:true,default: 1, enum: [1,2,3,5,25],},
     consultantYear:{type:Number,required:true},
     consultantField:{type:String,required:true,default: 1, enum: [1,2,3],},
     consultantContent:{type:String,required:true,},
     consultantCategory:{type:Number,required:true,default: 1, enum: [1,2,12,3,5],},
     consultantthumbnail: {
        type: String,
        required: true,
    },



    

});

schema.statics.consultantValidation= function (body) {
    return consultantSchema.validate(body, { abortEarly: false });
};

const  consultantModel=mongoose.model("Consultant",schema);
module.exports = consultantModel;




