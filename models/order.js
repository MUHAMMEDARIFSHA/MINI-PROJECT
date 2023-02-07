const mongoose = require('mongoose')

orderScheme = new mongoose.Schema({
    customerId:{
      type :String,
      ref :'User',
      required : true
    },
    items:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Products',
            required : true
        },
        productName:{
            type:String,
            required :true
        },
        color:{
            type :String,
            require: true
        },
        size :{
            type :String
        },
        quantity:{
            type:Number,
            require : true
        },
        price:{
            type:Number
        },
        image:{
            type:String,
            required :true
        }
    }],
    address:[{
        type:{
            address: {
                type: String
              },
             city: {
                type: String
              },
              state: {
                type: String
              },
              pincode: {
                type: Number
              }
},
        require: true
    }],
    number:{
        type: Number,
        require:true
    },
    totalAmount:{
        type : Number,
        required: true
    },
    paymentMethod:{
        type :String,
        require: true
    },
    paymentVerified:{
        type: Boolean
    },
    coupomId:{
        type :mongoose.Schema.Types.ObjectId,
        ref:'Coupon'
    },
    orderStatus:{
        type :String,
        default:'Placed'
    },
    cancelled:{
        type: Boolean,
        default : false
    },
    return:{
        type:Boolean,
        default : false
},
returnStatus:{
    type:String
}
},
{
timestamps : true
})

const Orders = mongoose.model('Orders',orderScheme)
module.exports = Orders