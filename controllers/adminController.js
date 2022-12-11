const Product = require("../models/productModel");
const Category=require('../models/category')
const Order=require('../models/orderSchema')
const User=require('../models/userModel')
const moment=require('moment')
module.exports = {
    
    login:(req,res)=>{
        res.render('admin/login')

    },
    renderHome:async(req,res)=>{
        let thirtyDaysAgo = new Date(new Date().getTime()-(30*24*60*60*1000));
        let oneWeekAgo = new Date(new Date().getTime()-(7*24*60*60*1000));
        const totalOrders=await Order.aggregate([
            {
                
                $match: {
                  'purchaseDate': { $gte: thirtyDaysAgo},
                  "status":{$ne:'Canceled'}
                }
                
            },
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userDetails'
                }
            }
        ]).sort({'purchaseDate':-1})
        
        const orderStatus=await Order.aggregate([
            {
                
                $match: {
                  'purchaseDate': { $gte: thirtyDaysAgo}
                  
                }  
            },{
                $project:{
                    "status":1
                }
            },{
                $group:{
                    _id:'$status',
                    count:{$sum:1}
                }
            }
        ])

        let statusName=[]
        let statusCount=[]
        orderStatus.forEach((e)=>{
            statusName.push(e._id)
            statusCount.push(e.count)
        })
        const weekRevenue=await Order.aggregate([
            {
                
                $match: {
                  'purchaseDate': { $gte: oneWeekAgo},
                  "status":{$ne:'Canceled'}
                  
                }  
            },{
                $project:{
                    "purchaseDate":1,
                    'total':1
                }
            },{
                $group:{
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
                    totalAmount:{$sum:'$total'},
                    count:{$sum:1}
                }
            }
        ]).sort({_id:1})
        let revenueDate=[]
        let revenueTotal=[]
        let noOfOrders=[]
        weekRevenue.forEach((e)=>{
            revenueDate.push(e._id)
            revenueTotal.push(e.totalAmount)
            noOfOrders.push(e.count)
        })
        let userOrders= await User.aggregate([
            {
                $match:{
                    isAdmin:{$ne:true}
                }
            },
            {
                $lookup:{
                    from:'orders',
                    localField:'_id',
                    foreignField:'user',
                    as:'orders'
                }
            },
            {
                $project:{
                    name:1,
                    email:1,
                    orders:1
                }
            },
            {
                $addFields: {
                  totalPrice: {
                    $sum: "$orders.total"
                  },
                  totalOrders:{
                    $size:'$orders'
                  }
                }
            },
            {
                $match:{
                    totalOrders:{$ne:0}
                }
            }
        ]).sort({totalPrice:-1})
        
        userOrders=(userOrders.length>5)?userOrders.slice(0,5):userOrders
        
        const totalUsers=await User.aggregate([
            {
                $match:{
                    'createdAt':{ $gte: thirtyDaysAgo},
                    'isAdmin':{$ne:true},
                    'isVerified':{$ne:false},
                    'isBloked':{$ne:true}
                }
            }
        ])
        let orderCount=totalOrders.length
        let totalRevenue=0
        totalOrders.forEach((e)=>{
            totalRevenue=e.total+totalRevenue
        })
        let topProducts=await Product.find().sort({sold:-1})
        topProducts=topProducts.slice(0,3)
        
        const userCount=totalUsers.length
        
        res.render('admin/adminHome',{
            totalOrders,
            orderCount,
            userCount,
            totalRevenue,
            statusCount,
            statusName,
            revenueDate,
            revenueTotal,
            noOfOrders,
            topProducts,
            userOrders
        })
    },
    
    editProduct:async(req,res)=>{
        id=req.query.id
        const category=await Category.find()
        product=await Product.findOne({_id:id})
        res.render('admin/editProduct',{product,category})
    },
    logout:(req,res)=>{
        req.session.adminLogin=false
        req.session.destroy()
        res.redirect('/')

    }

}