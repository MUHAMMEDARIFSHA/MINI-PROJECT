const mongoose = require('mongoose')

productSchema = new mongoose.Schema({

    productname: {
        type: String,
        require: [true,"Add product"] 
    },

    color: {
        type: String,
        required: [true, 'Colour cannot be empty']
    },
    size: {
        type: String,
        required: ['Size required']
    },
    description: {
        type: String,
        required: [true, 'Enter product description']
    },
    images: {
        type:[String],
    },
    totalStoke: {
        type: Number,
        required: [true, 'Enter Number of stokes left']
    },
    stokeLeft: {
        type: Number

    },
    price :{
        type :Number,
        require : [true,'Enter Price' ]
    },
    offer:{
       type :Number
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        
    },


})
const Products = mongoose.model('Products', productSchema)
module.exports = Products

