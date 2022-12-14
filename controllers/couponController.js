const Coupon=require('../models/couponModel')


module.exports={
    addCouponRender:(req,res)=>{
        res.render('admin/addCoupon')
    },
    addCoupon:async(req,res)=>{
        console.log(req.body);
        let data=req.body
        await new Coupon({
           title:data.title,
           code:data.code,
           percentage:parseInt(data.percentage),
           minimum:parseInt(data.minimum),
           maximum:parseInt(data.maximum),
           description:data.description,
           expiry:data.expiry
        }).save()
        res.redirect('/admin')
    },
    userCoupons:async(req,res)=>{
        let user=req.session.user
        let coupons=await Coupon.find()
        const wishLength=req.session.wishLength
        const cartLength=req.session.cartLength
        res.render('user/coupons',{user,coupons,wishLength,cartLength})
    },
    checkCoupon:async(req,res)=>{
        let couponCode=req.body.coupon
        let coupon=await Coupon.findOne({code:couponCode})
        if(coupon){
            res.json({coupon})
        }else if(!couponCode){
            res.json({message:'Enter the coupon before apply'})
        }else{
            res.json({message:'Invalid Couon Code'})
        }
    },
    listCoupons:async(req,res)=>{
        const coupons=await Coupon.find()
        res.render('admin/coupons',{coupons})
    }
}