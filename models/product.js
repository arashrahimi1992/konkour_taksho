const mongoose=require('mongoose');


//yup validation
const{productSchema}=require("./secure/productValidation");

const schema=new mongoose.Schema({

     productName:{type:String,required:true,trim:true,},
     productLittleTitle:{type:String,required:true,trim:true,},
     productCreateAt:{type:Date,default:Date.now,},
     productPrice:{type:Number,required:true},
     productCount:{type:Number,required:true},
     productOffer:{type:Number,required:true,default: 0,},
     productAvailable:{type:String,required:true,default:"0",enum: ["0","1"]},
     productContent:{type:String,required:true,},
     productCategory:{type:Number,required:true,default: 1, enum: [1,2,3,4,5],},
     productthumbnail: {
        type: String,
        required: true,
    },

});

schema.statics.productValidation= function (body) {
    return productSchema.validate(body, { abortEarly: false });
};

const  productModel=mongoose.model("Product",schema);
module.exports = productModel;




