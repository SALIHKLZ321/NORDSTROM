const User = require("../models/userModel");
const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Product=require('../models/productModel')

module.exports = {
  addToWishList: async (req, res) => {
    prodId = req.query.id;
    userId = mongoose.Types.ObjectId(req.session.user._id);
    
    const prodExist = await User.findOne({
      _id: userId,
      wishlist: mongoose.Types.ObjectId(prodId),
    });
    
    if (prodExist == null) {
      await User.updateOne(
        { _id: mongoose.Types.ObjectId(req.session.user._id) },
        {
          $push: { wishlist: mongoose.Types.ObjectId(prodId) },
        }
        
      ).then((response) => {
        console.log(response);
        res.json({inc:true})
      });
    } else {
      await User.updateOne(
        { _id: mongoose.Types.ObjectId(req.session.user._id) },
        {
          $pull: { wishlist: mongoose.Types.ObjectId(prodId) },
        }
      ).then((r)=>{
        res.json({inc:false})
      })
    }
  },
  renderPage:async(req,res)=>{
    let user=req.session.user;
    let userDetails=await User.findOne({_id:mongoose.Types.ObjectId(user._id)})
   
    if(userDetails.wishlist==null){
    res.render('user/wishlist',{user,products:false})
    }else{
       let wishlength=userDetails.wishlist.length
       let products=[]
       for(let i=0;i<userDetails.wishlist.length;i++){

        let product=await Product.findOne({_id:userDetails.wishlist[i]})
        products.push(product)
       }
       res.render('user/wishlist',{user,products,wishlength})
    }
    }
};
