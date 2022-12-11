const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: [
    {
      name:{
        type:String
      },
      pin:{
        type: String
      },
      phone:{
        type:String
      },
      house:{
        type:String
      },
      street:{
        type:String
      },
      city:{
        type:String
      },
      state:{
        type:String
      }
    }
  ],
 city: {     
   type: String,
   },
   pin: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isBlocked:{
    type: Boolean,
    default:false,
  },
  isAdmin:{
    type:Boolean,
    default:false
    
  },
  isVerified:{
    type:Boolean,
    default:false  
  },
  wishlist: {
    type: Array,
  }
},{
  timestamps:true
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
