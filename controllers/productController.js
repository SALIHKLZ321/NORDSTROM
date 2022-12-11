const multer = require('multer');
const sharp = require('sharp');
const path = require("path");
const Product = require("../models/productModel");
const Category = require('../models/category')


////////////////////////////////////////////////////////////////////////

//Multer setup
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('File is not an image'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = {

    uploadProductPic : upload.fields([
        {
          name: 'thumbnail',
          maxCount: 1,
        },
        {
          name: 'images',
          maxCount: 6,
        },
      ]),

      resizeProductPic : (async (req, res, next) => {
        //Validations
        if (!req.files.thumbnail || !req.files.images) return next();
      
        // Get the thumbnail
        req.body.thumbnail = `product-${Date.now()}-thumb.jpeg`;
      
        await sharp(req.files.thumbnail[0].buffer)
          .resize(450, 450)
          .toFormat('jpeg')
          .jpeg({
            quality: 90,
          })
          .toFile(`public/productimages/${req.body.thumbnail}`);
      
        // Get the images array
        req.body.images = [];
        await Promise.all(
          req.files.images.map(async (el, i) => {
            const filename = `product-${Date.now()}-${i + 1}-image.jpeg`;
            await sharp(req.files.images[i].buffer)
              .resize(450, 450)
              .toFormat('jpeg')
              .jpeg({
                quality: 90,
              })
              .toFile(`public/productimages/${filename}`);
      
            req.body.images.push(filename);
          })
        );
        next();
      }),
      addProductPage:async(req,res)=>{
        const category=await Category.find()
        res.render('admin/addProduct',{category})
    },

  addProduct: (req, res, next) => {
    const {
      title,
      category,
      brand,
      shortdescription,
      size,
      price,
      quantity,
      fulldetails,
      group_tag,
      thumbnail,
      images
    } = req.body;


    const newProduct = new Product({title,category, brand,shortdescription,size,price,quantity,fulldetails,group_tag, thumbnail, images})
    newProduct.save().then((result) => {
        res.redirect('/admin/products')
    }).catch(err => {
        console.log(err);
    })
    
    
  },
  getAllProducts:async(req,res)=>{
    const productDetails= await Product.find()
    res.render('admin/listProduct',{productDetails})
  },
  
  deleteProduct:async(req,res)=>{
    id=req.query.id
    await Product.deleteOne({_id:id})
    res.redirect('/admin/products')
  },
  editProduct:async(req,res)=>{
    data=req.body
    id=req.query.id
    
    await Product.updateOne({_id:id},{
        $set:{
            title:data.title,
            category:data.category,
            brand:data.brand,
            shortdescription:data.shortdescription,
            size:data.size,
            price:data.price,
            quantity:data.quantity,
            fulldetails:data.fulldetails,
            thumbnail:data.thumbnail,
            images:data.images,
            group_tag:data.group_tag
        }
    })
    res.redirect('/admin/products')
  },
    productDetails:async(req,res)=>{
    id=req.params.id
    
    const product = await Product.findOne({_id:id})
    
    if(req.session.adminLogin){
      res.render('admin/productDetails',{product})
    }else{
      res.render('user/product-detail',{product})
    }
  },
  category:(req,res)=>{
    res.render('admin/addCategory')
  },
  addCategory:(req,res)=>{
    req.body.image=req.file.path
    const {title,description,image}=req.body
    const newCategory=new Category({title,description,image})
    newCategory.save().then((result=>{
      res.redirect('/admin')
    }))
  },
  getAllCategories:async(req,res)=>{
    const category=await Category.find()
    res.render('admin/listCategory',{category})
  },
  productView:async(req,res)=>{
  
    let user=req.session.user
    
    prodId=req.query.id
    let product=await Product.findOne({_id:prodId})

    if(req.session.loggedIn){
      user=req.session.user
      wishlength=user.wishlist.length;
    res.render('user/product-detail',{product,user,wishlength})
    }else{
      res.render('user/product-detail',{product,user:false,wishlength:false})
    }
  },
  quickView:async(req,res)=>{
    prodId=req.query.id
    product=await Product.findOne({_id:prodId})
    res.json(product)
  },
  shopPage:async(req,res)=>{
    const user=req.session.user
    const products=await Product.find()
    const category=await Category.find()
    if(user){
      res.render('user/shop',{user,products,category})
    }else{
      res.render('user/shop',{user:false,products,category})
    }
  },
  filterByCategory:async(req,res)=>{
    
    let category=req.body.category
    if(category!=null){
    var products = await Promise.all(
      category.map(async (e) => {

        let p = await Product.find({ category: e });
        return p;
      })
      )
      products=products.flat()
    }else{
      var products=await Product.find()
    }
      res.json({products})
  },
  filterByPrice:async(req,res)=>{
    let minimum=req.body.minimum
    let maximum=req.body.maximum
    let products=await Product.find({"$or":[{"price":{"$gt":1000}},{"price":{"$lte":5000}}]})
    console.log(products);
  }


};

