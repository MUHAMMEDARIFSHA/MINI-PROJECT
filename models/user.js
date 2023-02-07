const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema=new mongoose.Schema({
    username :{
        type:String,
        require:true
    },
   
    email:{
        type:String,
        require:true,
        lowercase:true
   },
   number:{
    type:Number,
    require:true
   },
    password:{
        type:String,
        require:true
   },
   shippingAddress: [{
    type: {
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
    }
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  cart:{
    type:[{
   productId:{   type :mongoose.Schema.Types.ObjectId,
      ref :'Products'
   },
   quantity:{
    type:Number
   }

    }]
  },
  cartTotal: {
    type: Number,
    default: 0
  },
  wishlist:[{
    type:{
      productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products'
      }
    }
  }],
  
   isBlocked:{
     type:Boolean,
     default:false
   }
})
UserSchema.pre('save', async function(next){
  try {
    hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword
    next();
  } catch (error) {
    console.log(error)
  }
})
const User = mongoose.model('User',UserSchema)

module.exports = User