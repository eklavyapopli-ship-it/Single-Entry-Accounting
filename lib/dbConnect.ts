import mongoose from "mongoose";

const ConnectToDatabase = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log("connected to db")
    } catch (error) {
        console.log(error)
    }
}

export default ConnectToDatabase;