import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/SocialMedia").then(()=>{
            console.log("DB Connected Successfully")
        })
    }
    catch(error){
        console.log("error",error)
    }
}

export default connectDB()