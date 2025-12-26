import mongoose from "mongoose";


const dataSchema= new mongoose.Schema({
    name: {type:String},
    PhoneNo: {type: String, required:true},
    VehicleType:{type: String},
    PreferedTimeSlot:{type: String},
    AdditionalSlot:{type: String},

})

const Data = mongoose.models.Reg || mongoose.model("Reg", dataSchema)

export default Data;