const mongoose = require("mongoose");
const bannerSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    route:{
        type:String
    },
    description:{
        type:String
    },
    image:{
        type:String,
        required:true
    }
})
const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;