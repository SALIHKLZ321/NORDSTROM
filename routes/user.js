const express=require('express')
const auth=require('../controllers/auth');
const cartHelper = require('../controllers/cartHelper');
const productController = require('../controllers/productController');
const { renderEditAddress } = require('../controllers/userController');
const userController = require('../controllers/userController')
const wishListController=require('../controllers/wishlist')
const orderController=require('../controllers/orderController')
const onlinePayment=require('../controllers/onlinePayment');
const couponController = require('../controllers/couponController');

const router=express.Router();

router.get('/',userController.renderHome)
router.get('/login',userController.login)
router.get('/signup',userController.signup)
router.get('/logout',userController.logout)

router.get('/shop',productController.shopPage)

router.get('/profile',auth.isUser,userController.profilePage)
router.get('/add-address',auth.isUser,userController.address)
router.get('/delete-address',auth.isUser,userController.deleteAddress)
router.get('/edit-address',auth.isUser,userController.renderEditAddress)

router.get('/add-to-cart',auth.isUser,userController.addToCart)
router.get('/cart',auth.isUser,cartHelper.cartPage)
router.get('/inc-quantity',cartHelper.incrementQuantity)
router.get('/dec-quantity',cartHelper.decrementQuantity)
router.get('/remove-from-cart',cartHelper.removeFromCart)

router.get('/checkout',auth.isUser,orderController.renderCheckout)

router.get('/add-to-wishlist',auth.isUser,wishListController.addToWishList)
router.get('/wishlist',auth.isUser,wishListController.renderPage)

router.get('/product-detail',productController.productView)
router.get('/quickview',productController.quickView)

router.get('/coupons',auth.isUser,couponController.userCoupons)

router.get('/test',(req,res)=>{
    res.render('user/shop',{user:false})
})


router.get('/my-orders',auth.isUser,orderController.myOrderPage)
router.get('/orderDetails',auth.isUser,orderController.orderDetails)
router.get('/cancel-order',auth.isUser,orderController.cancelOrder)



router.post('/signup',userController.registerUser)
router.post('/otpverify',userController.otpverify)
router.post('/login',userController.doLogin)
router.post('/add-address',auth.isUser,userController.addAddress)
router.post('/edit-address',auth.isUser,userController.editAddress)
router.post('/checkout',auth.isUser,orderController.checkOut)
router.post('/verifyPayment',auth.isUser,onlinePayment.verifyPayment)
router.post('/coupon-check',auth.isUser,couponController.checkCoupon)
router.post('/category-filter',productController.filterByCategory)
router.post('/price-filter',productController.filterByPrice)


// Order success
router.get('/orderSuccess',auth.isUser,orderController.orderSuccess)


// router.all('/',(req,res)=>{
//     res.render('user/404')
// })

module.exports = router;