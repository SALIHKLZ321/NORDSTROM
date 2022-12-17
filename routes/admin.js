const express=require('express')
const adminController = require('../controllers/adminController')
const userController= require('../controllers/userController')
const productHelper=require('../controllers/productController')
const bannerController=require('../controllers/bannerController')
const auth=require('../controllers/auth')
const multer=require('../utils/multer')
const orderController = require('../controllers/orderController')
const couponController=require('../controllers/couponController')
const router=express.Router();



router.get('/',auth.isAdmin,adminController.renderHome)
// router.get('/login',adminController.login)
router.get('/addproduct',auth.isAdmin,productHelper.addProductPage)
router.get('/users',auth.isAdmin,userController.getAllUsers)
router.get('/useractivate',auth.isAdmin,userController.activateUser)
router.get('/userblock',auth.isAdmin,userController.blockUser)
router.get('/products',auth.isAdmin,productHelper.getAllProducts)
router.get('/deleteproduct',auth.isAdmin,productHelper.deleteProduct)
router.get('/editproduct',auth.isAdmin,adminController.editProduct)
router.get('/productdetails/:id',auth.isAdmin,productHelper.productDetails)
router.get('/logout',adminController.logout)


router.get('/add-category',auth.isAdmin,productHelper.category)
router.get('/list-category',auth.isAdmin,productHelper.getAllCategories)

router.get('/banner',auth.isAdmin,bannerController.renderPage)
router.get('/add-banner',auth.isAdmin,bannerController.renderAddBanner)
router.get('/editbanner',auth.isAdmin,bannerController.editBannerPage)
router.get('/deletebanner',auth.isAdmin,bannerController.deleteBanner)

router.get('/order-list',auth.isAdmin,orderController.listAllOrders)

router.get('/coupons',auth.isAdmin,couponController.listCoupons)
router.get('/add-coupon',auth.isAdmin,couponController.addCouponRender)
router.get('/delete-coupon',auth.isAdmin,couponController.deleteCoupon)

router.post('/addproduct',productHelper.uploadProductPic,productHelper.resizeProductPic,productHelper.addProduct)
router.post('/editproduct',productHelper.uploadProductPic,productHelper.resizeProductPic,productHelper.editProduct)
router.post('/add-category',multer.single('image'),productHelper.addCategory)
router.post('/add-banner',multer.single('image'),bannerController.addBanner)
router.post('/edit-banner',multer.single('image'),bannerController.editBanner)
router.post('/add-coupon',couponController.addCoupon)
router.post('/change-order-status',auth.isAdmin,orderController.changeStatus)


module.exports = router;