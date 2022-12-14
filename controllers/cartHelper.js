const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const { default: mongoose } = require("mongoose");

module.exports = {
  addToCart: async (productId, userId) => {
    let prod = await Product.findOne({
      _id: mongoose.Types.ObjectId(productId),
    });
    let product = {
      id: mongoose.Types.ObjectId(productId),
      quantity: 1,
      actualPrice: parseInt(prod.price),
    };
    let userCart = await Cart.findOne({
      user: mongoose.Types.ObjectId(userId),
    });
    if(prod.quantity>0){

    if (userCart) {
      let productExist = await Cart.findOne({
        user: mongoose.Types.ObjectId(userId),
        "products.id": mongoose.Types.ObjectId(productId),
      });
      if (productExist) {
        let prod = await Product.findOne({
          _id: mongoose.Types.ObjectId(productId),
        });

        let price = parseInt(prod.price);

        await Cart.updateOne(
          {
            user: mongoose.Types.ObjectId(userId),
            "products.id": mongoose.Types.ObjectId(productId),
          },
          {
            $inc: {
              "products.$.quantity": 1,
              "products.$.actualPrice": price,
            },
          }
        );
        return {exist:true}
      } else {
        await Cart.updateOne(
          { user: mongoose.Types.ObjectId(userId) },
          {
            $push: { products: product },
          }
        );
          
      }
    } else {
      await new Cart({
        user: mongoose.Types.ObjectId(userId),
        products: [product],
      }).save();
      
    }
    return true;
  }else{
    return false;
  }
  },
  cartPage: async (req, res) => {
    let user = req.session.user;
    const wishLength=req.session.wishLength
    const cartLength=req.session.cartLength
    let cart = await Cart.findOne({ user: mongoose.Types.ObjectId(user._id) });
    if (cart) {
      var products = await Promise.all(
        cart.products.map(async (e) => {
          let p = await Product.findOne({ _id: e.id });
          p.actualPrice = e.actualPrice;
          p.quanty = e.quantity;
          return p;
        })
      );

      res.render("user/cart", { user, products, wishLength,cartLength });
    } else {
      res.render("user/cart", { user, products: false, wishLength,cartLength });
    }
  },
  incrementQuantity: async (req, res) => {
    productId = req.query.id;
    userId = req.session.user._id;
    let prod = await Product.findOne({
      _id: mongoose.Types.ObjectId(productId),
    });

    let price = parseInt(prod.price);

    await Cart.updateOne(
      {
        user: mongoose.Types.ObjectId(userId),
        "products.id": mongoose.Types.ObjectId(productId),
      },
      {
        $inc: {
          "products.$.quantity": 1,
          "products.$.actualPrice": price,
        },
      }
    );
    res.json(true);
  },
  decrementQuantity: async (req, res) => {
    productId = req.query.id;
    userId = req.session.user._id;
    let prod = await Product.findOne({
      _id: mongoose.Types.ObjectId(productId),
    });

    let price = parseInt(prod.price);

    await Cart.updateOne(
      {
        user: mongoose.Types.ObjectId(userId),
        "products.id": mongoose.Types.ObjectId(productId),
      },
      {
        $inc: {
          "products.$.quantity": -1,
          "products.$.actualPrice": -price,
        },
      }
    );
    res.json(true);
  },
  removeFromCart: async (req, res) => {
    userId = req.session.user._id;
    prodId = req.query.id;
    await Cart.updateOne(
      { user: mongoose.Types.ObjectId(userId) },
      {
        $pull: { products: { id: mongoose.Types.ObjectId(prodId) } },
      }
    );
    const prodExist = await User.findOne({
      _id: userId,
      wishlist: mongoose.Types.ObjectId(prodId),
    });
    if (prodExist == null) {
      await User.updateOne(
        { _id: mongoose.Types.ObjectId(userId) },
        {
          $push: { wishlist: mongoose.Types.ObjectId(prodId) },
        }
        
        ).then((response) => {
          // console.log(response);
          // res.json({inc:true})
        });
      }
      res.json({ status: true });
      
    },
  };
