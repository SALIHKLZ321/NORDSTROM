const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderSchema");
const { default: mongoose } = require("mongoose");
const { response } = require("express");
const Razorpay=require('razorpay');
const RAZOR_KEY_ID=process.env.RAZOR_KEY_ID
const RAZOR_SECRET=process.env.RAZOR_SECRET
let instance = new Razorpay({ key_id: `${RAZOR_KEY_ID}`, key_secret: `${RAZOR_SECRET}` })

module.exports = {
    genarateRazorPay:async(orderId,total)=>{
        // console.log(orderId,total);
         let res=await instance.orders.create({
            amount: total*100,
            currency: "INR",
            receipt: ""+orderId,
            
          })
          
          return res
    },
    verifyPayment:(req,res)=>{
        let user=req.session.user
        let orderId = req.body.payment.razorpay_order_id
        let paymentId=req.body.payment.razorpay_payment_id
        let signature=req.body.payment.razorpay_signature
        let order=req.body.order
        console.log(order);
        return new Promise(async(resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256',`${RAZOR_SECRET}`)

            hmac.update(`${orderId}|${paymentId}`)
            hmac=hmac.digest('hex')
            if(hmac==signature){
                
                resolve()
            }else{
                reject()
                await Order.deleteOne({_id:orderId})
            }
        }).then(async()=>{
            console.log('payment success');
            console.log(order.receipt);
            let orderId=order.receipt
            await Order.updateOne({_id:mongoose.Types.ObjectId(orderId)},{
                $set:{
                    status:'Placed'
                }
            })
            let cart=await Cart.findOne({ user:mongoose.Types.ObjectId(user._id)})
            cart.products.map(async(e)=>{
                await Product.updateOne({_id:e.id},{
                  $inc:{
                    'quantity':-e.quantity,
                    'sold':+e.quantity
                  }
                })
               })
            res.json({status:true})
            
            await Cart.deleteOne({ user:mongoose.Types.ObjectId(user._id)});
        }).catch(async(err)=>{
            console.log(err);
            res.json({status:false})
            await Order.deleteOne({_id:orderId})

        })
    }

}