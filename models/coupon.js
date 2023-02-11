const mongoose = require('mongoose')


const CouponSchema =  new mongoose.Schema({
    coupon :{
        type :String,
        required :true
    },
    details:{
        type:String,
        required:true
    },
    isPercentage:{
        type : Boolean,
        default: false
    },
    expiry:{
        type : Date,
        
    },
    discount:{
        type:Number,
        
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]

})
 const Coupons = mongoose.model('Coupons',CouponSchema)
 module.exports = Coupons
