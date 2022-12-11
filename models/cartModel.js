const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        required:true
    },
    products:{
        type: Array,
    }
        
    
    
})
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;