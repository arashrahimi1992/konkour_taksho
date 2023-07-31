const mongoose=require('mongoose');// in gesmat kollan 57

const connectDB=async ()=>{

try
{
const conn=await mongoose.connect("mongodb://localhost:27017/consultant_db",{
useNewUrlParser:true,
useUnifiedTopology:true,
useFindAndModify:true,
});
console.log(` MongoDB connected to db: ${conn.connection.host}`);
}
catch(err)
{
console.log("error in connect to mongoDB",err);
process.exit(1);//khatayi pish omade va app terminate mishe
}

}

module.exports=connectDB;