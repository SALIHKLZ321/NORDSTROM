const { default: mongoose } = require('mongoose')
const User=require('../models/userModel')
const Cart=require('../models/cartModel')
module.exports={
    counts:async(req,res,next)=>{
        const userId=req.session.user._id
        const user=await User.findOne({_id:mongoose.Types.ObjectId(userId)})
        const cart=await Cart.findOne({user:mongoose.Types.ObjectId(userId)})
        let wishLength=user.wishlist.length
        let cartLength
        if(cart){
            cartLength=cart.products.length
            }else{
              cartLength=0
            }
        req.session.cartLength=cartLength
        req.session.wishLength=wishLength
          next()
    }
}