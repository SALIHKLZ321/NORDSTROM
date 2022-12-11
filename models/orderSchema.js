const mongoose = require('mongoose');

const Schema=mongoose.Schema

const orderSchema = new Schema({
    user : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    paymentMethod : {
        type : String,
        required : true
    },
    products : {
        type : Array,
        required : true
    },
    total : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    deliveryAddress : {
        type : Array,
        required : true
    },
    purchaseDate: {
        type : Date,
    }, 
    expectedDeliveryDate: {
        type : Date,
    },
    deliveredDate : {
        type : Date
    } 
})

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;