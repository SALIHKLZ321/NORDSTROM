const moment = require("moment");
const otp = require("../verfication/twilio");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const cartHelper = require("./cartHelper");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { default: mongoose } = require("mongoose");
const Cart = require("../models/cartModel");
const Banner=require('../models/banner')


module.exports = {
  renderHome: async (req, res) => {
    if (!req.session.loggedIn) {
      const banner=await Banner.find()
      const products = await Product.find().sort({title:-1});
      res.render("user/home", { user: false, products,banner });
    } else {
      const userId=req.session.user._id
        const userInfo=await User.findOne({_id:mongoose.Types.ObjectId(userId)})
        const cart=await Cart.findOne({user:mongoose.Types.ObjectId(userId)})

        let wishLength=userInfo.wishlist.length
        let cartLength
        if(cart){
        cartLength=cart.products.length
        }else{
          cartLength=0
        }
      const products = await Product.find().sort({title:-1});
      const banner=await Banner.find()
      let user = req.session.user;
      let wishlength=user.wishlist.length
      res.render("user/home", { user, products,wishLength,cartLength ,banner });
    }
  },

  profilePage:async(req,res)=>{
    userId=req.session.user._id
    user=await User.findOne({_id:userId}) 
    const wishLength=req.session.wishLength
    const cartLength=req.session.cartLength
    res.render('user/profile',{user,wishLength,cartLength})
  },
  address:(req,res)=>{
    user=req.session.user
    const wishLength=req.session.wishLength
    const cartLength=req.session.cartLength
    res.render('user/address',{user,wishLength,cartLength})
  },
  addAddress:async(req,res)=>{
    data=req.body
    await User.updateOne(
      { _id: mongoose.Types.ObjectId(req.session.user._id) },
      {
        $push: { address: data},
      }
      
    )
    res.redirect('/profile')
    
  },
  deleteAddress:async(req,res)=>{
    id=req.query.id
    let user= await User.findOne({_id:req.session.user._id})
    
    
    await User.updateOne({_id:user._id},{
      $pull:{
        address:{_id:id}
      }
    })
    res.redirect('/profile')
  },
  renderEditAddress:async(req,res)=>{
    const addressId=req.query.id
    
    let user=await User.findOne({_id:req.session.user._id})
    const index = user.address.findIndex(el => el._id.toString() === addressId )
    let address=user.address[index]
    
    // await user.save();
    
    
    const wishLength=req.session.wishLength
    const cartLength=req.session.cartLength
    res.render('user/editAddress',{user,address,wishLength,cartLength})
  },
  editAddress:async(req,res)=>{
    const addressId=req.query.id
    let data=req.body
    console.log(data);
    let user=await User.findOne({_id:req.session.user._id})
    const index = user.address.findIndex(el => el._id.toString() === addressId )
    user.address[index] = data
    await user.save()
    res.redirect('/profile')
  },


  login: (req, res) => {
    if (!req.session.loggedIn) {
      res.render("user/login", { user: false });
    } else {
      res.redirect("/");
    }
  },
  signup: (req, res) => {
    if (!req.session.loggedIn) {
      res.render("user/signup", { user: false });
    } else {
      res.redirect("/");
    }
  },

  registerUser: (req, res) => {
    // console.log(req.body);
    const {
      fname,
      lname,
      email,
      phone,
      address,
      city,
      pin,
      password,
      confirm,
    } = req.body;
    if (
      !fname ||
      !lname ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !pin ||
      !password ||
      !confirm
    ) {
      console.log("Fill empty fields");
    }
    //Confirm Passwords
    if (password !== confirm) {
      res.locals.message = "password confirmation failed enter same password";
      res.render("user/signup");
    } else {
      //Validation
      User.findOne({ email: email }).then((user) => {
        if (user) {
          res.locals.message = "Email already exists";
          res.render("user/signup", {
            fname,
            lname,
            email,
            phone,
            address,
            city,
            pin,
            password,
            confirm,
            user: false,
          });
        } else {
          const name = fname.concat(" ").concat(lname);
          // console.log(name);
          //Validation
          const newUser = new User({
            name,
            email,
            phone,
            address,
            city,
            pin,
            password,
          });

          // req.session.loggedIn=true;
          // req.session.user=req.session.userCheck
          //Password Hashing
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then((user) => {
                  otp.sendSms(user.phone);
                  res.render("user/otp", { user });
                })
                .catch((err) => console.log(err));
            })
          );
        }
      });
    }
  },
  otpverify: (req, res) => {
    otp.verfiySms(req.body.phone, req.body.otp).then(async (verification_check) => {
        console.log(verification_check);
        console.log(req.body);
        const id = req.body.id;
        if (verification_check.status == "approved") {
          await User.updateOne(
            {
              _id: mongoose.Types.ObjectId(id),
            },
            {
              $set: {
                isVerified: true,
              },
            }
          ).then((e) => {
            console.log(e);
          });
          req.session.user = await User.findOne({ _id: id });

          req.session.loggedIn = true;

          res.redirect("/");
        } else {
          const {
            fname,
            lname,
            email,
            phone,
            address,
            city,
            pin,
            password,
            confirm,
          } = req.session.user;
          res.locals.message = "OTP verification failed";

          res.render("user/signup", { user: false });
        }
      });
  },

  doLogin: (req, res) => {
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        res.locals.message = "Invalid Email or Password !";
        res.render("user/login");
      } else if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.locals.message = "Invalid Email or Password !";
        res.render("user/login", { user: false });
      } else {
        if (user.isBlocked === true) {
          console.log("your account has been suspended");
          res.locals.message = "your account has been suspended";
          res.render("user/login", { user: false });
        } else if (user.isVerified === false) {
          otp.sendSms(user.phone);
          res.render("user/otp", { user });
        } else {
          if (user.isAdmin === true) {
            console.log("admin");
            req.session.adminLogin = true;
            res.redirect("/admin");
          } else {
            req.session.loggedIn = true;
            req.session.user = user;
            res.redirect("/");
          }
        }
      }
    });
  },
  logout: (req, res) => {
    req.session.loggedIn = false;
    req.session.destroy();
    res.redirect("/");
  },
  getAllUsers: async (req, res) => {
    const userDetails = await User.find();
    res.render("admin/listUser", { userDetails, moment });
  },
  activateUser: async (req, res) => {
    id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/users");
  },
  blockUser: async (req, res) => {
    id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: true } });

    res.redirect("/admin/users");
  },
  addToCart: async(req, res) => {
    let success = await cartHelper.addToCart(req.query.id, req.session.user._id);
    console.log(success)
    res.json(success);
  },
};
