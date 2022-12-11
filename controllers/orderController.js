const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderSchema");
const { default: mongoose } = require("mongoose");
const { address } = require("./userController");
const { response } = require("express");
const onlinePayment = require('../controllers/onlinePayment')

module.exports = {
  renderCheckout: async (req, res) => {
    const userId = req.session.user._id;
    const user = await User.findOne({ _id: userId });
    const address = user.address;
    const wishlength = user.wishlist.length;
    const cart = await Cart.findOne({ user: userId });
    var products = await Promise.all(
      cart.products.map(async (e) => {
        let p = await Product.findOne({ _id: e.id });
        p.actualPrice = e.actualPrice;
        p.quanty = e.quantity;
        return p;
      })
    );

    res.render("user/checkout", { user, address, wishlength, products });
  },
  orderSuccess : (req,res)=>{
    let user = req.session.user
    let wishlength = user.wishlist.length;
    
    res.render("user/order-success", { user, wishlength });

  },
  checkOut: async (req, res) => {
    let user = req.session.user;

    let data = req.body;
    if (req.body.payment == "Cash On Delivery") {
      
      let cart = await Cart.findOne({ user: user._id });
      let address;
      if(req.body.address){
      let addId = req.body.address;
      let user = await User.findOne({ _id: req.session.user._id });
      const index = user.address.findIndex(
        (el) => el._id.toString() === addId
      );
      address = user.address[index];
      }

      let newOrder = new Order({
        user: user._id,
        paymentMethod: data.payment,
        products: cart.products,
        total: parseInt(data.total),
        status: "Placed",
        deliveryAddress: [
          (data.name?data.name:address.name),
          (data.house?data.house:address.house),
          (data.street?data.street:address.street),
          (data.city?data.city:address.city),
          (data.state?data.state:address.state),
          (data.pin?data.pin:address.pin),
          (data.phone?data.phone:address.phone),
        ],
        purchaseDate: Date.now(),
      })
        .save()
        .then((user) => {
          res.json({status : true})

        });
        console.log(cart.products);
       await cart.products.map(async(e)=>{
        await Product.updateOne({_id:e.id},{
          $inc:{
            'quantity':-e.quantity,
            'sold':+e.quantity
          }
        })
       })
        await Cart.deleteOne({ user:mongoose.Types.ObjectId(user._id)});
    } else {
        let cart = await Cart.findOne({ user: user._id });
      let address;
      if(req.body.address){
      let addId = req.body.address;
      let user = await User.findOne({ _id: req.session.user._id });
      const index = user.address.findIndex(
        (el) => el._id.toString() === addId
      );
      address = user.address[index];
      }

      let wishlength = user.wishlist.length;
      let newOrder = new Order({
        user: user._id,
        paymentMethod: data.payment,
        products: cart.products,
        total: parseInt(data.total),
        status: "Pending",
        deliveryAddress: [
          (data.name?data.name:address.name),
          (data.house?data.house:address.house),
          (data.street?data.street:address.street),
          (data.city?data.city:address.city),
          (data.state?data.state:address.state),
          (data.pin?data.pin:address.pin),
          (data.phone?data.phone:address.phone),
        ],
        purchaseDate: Date.now(),
      })
        .save()
        .then(async(response)=>{
            let order=await onlinePayment.genarateRazorPay(response._id,response.total).then((order)=>{
              res.json({order})
            })
          
        });
        
    }
  },
  myOrderPage:async(req,res)=>{
    let user=req.session.user
    let userId=user._id
    await Order.deleteMany({status:'Pending'})
    let allOrders=await Order.find({user:mongoose.Types.ObjectId(userId)}).sort({'purchaseDate':-1})
    let orders=[]
    
    allOrders.map((e)=>{
      if(e.status!='Canceled'){
        orders.push(e)
      }
    })

    res.render('user/myOrder',{orders,user})

  },
  orderDetails:async(req,res)=>{
    let user=req.session.user
    let orderId=req.query.id
    let order=await Order.findOne({_id:orderId})
    
    let orderItems=await Order.aggregate([
      {
        $match:{
          _id:mongoose.Types.ObjectId(orderId)
        } 
      },
      {
        $unwind:{
          path:"$products"
        }
      },
      {
        $lookup:{
          from:'products',
          localField:'products.id',
          foreignField:'_id',
          as:"product"
        }
      },
      {
        $project:{
          product:1,
          "products.quantity":1
        }
      }
    ])
    res.render('user/orderDetails',{user,order,orderItems})
  },
  cancelOrder:async(req,res)=>{
    const orderId=req.query.id
    let order=await Order.findOne({_id:mongoose.Types.ObjectId(orderId)})
    await Order.updateOne({_id:mongoose.Types.ObjectId(orderId)},{
      $set:{
          status:'Canceled'
      }
  }).then(()=>{
    res.json({status:true})
  })
  await order.products.map(async(e)=>{
    await Product.updateOne({_id:e.id},{
      $inc:{
        'quantity':+e.quantity
      }
    })
   })

  },
  listAllOrders:async(req,res)=>{
    let orders=await Order.aggregate([
      {
        $lookup:{
          from:'users',
          localField:'user',
          foreignField:'_id',
          as:'userdetails'
        }
      }
      
    ])
    
    

    res.render('admin/listOrders',{orders})
  },
  changeStatus:async(req,res)=>{
    let orderId=mongoose.Types.ObjectId(req.body.orderId)
    let order=await Order.findOne({_id:mongoose.Types.ObjectId(orderId)})
    let newStatus=req.body.status
    await Order.updateOne({_id:orderId},{
      $set:{
        status:newStatus
      }
    })
    if(newStatus=='Canceled'){
      await order.products.map(async(e)=>{
        await Product.updateOne({_id:e.id},{
          $inc:{
            'quantity':+e.quantity
          }
        })
       })
    }
    res.json({staus:true})

  }
};
