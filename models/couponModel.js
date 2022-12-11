const mongoose = require("mongoose");
const couponSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    percentage:{
        type:Number,
        required:true
    },
    minimum:{
        type:Number,
        required:true
    },
    maximum:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    expiry:{
        type:Date
    }
    
})
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;