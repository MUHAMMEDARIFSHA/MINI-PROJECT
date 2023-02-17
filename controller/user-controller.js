
const User = require('../models/user')
const message = require('../twilio')
const bcrypt = require('bcrypt')
const Products = require('../models/products')
const Orders = require('../models/order')
const Razorpay = require ('razorpay')
const Payments =  require('../models/payment')
const crypto = require('crypto')
const { log } = require('util')
const Coupons = require('../models/coupon')
const paypal = require('@paypal/checkout-server-sdk')
const Environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID,process.env.PAYPAL_CLIENT_SECRET)
const paypalClient = new paypal.core.PayPalHttpClient(Environment)

module.exports = {

   getLogin: (req, res) => {
      if (req.session.message) {
         const message = req.session.message
         req.session.message = ""
         return res.render('login', { message })
      }
      else {
         const message = ""
         return res.render('login', { message })
      }

   },

   getRegister: (req, res) => {
      if (req.session.message) {
         const message = req.session.message
         req.session.message = ""
         return res.render('register', { message })
      }
      else {
         const message = ""
         return res.render('register', { message })

      }
   },
   getLandingpage: async (req, res) => {
      const products = await Products.find({ isDeleted: false })

      return res.render('landingpage', { products })
   },
   getHomepage: async (req, res) => {
      const products = await Products.find({ isDeleted: false })
      const user = await User.find({ isBlocked:false})
      return res.render('userhome', { products,user})
   },
   getOtp: (req, res) => {
      return res.render('otp')
   },

   saveUser: async (req, res) => {
      const check = req.body.email
      const storeuser = ({
         username: req.body.username,
         email: req.body.email,
         number: req.body.number,
         password: req.body.password
      })
      req.session.storeuser = storeuser

      const email = await User.find({ email: req.body.email })
      const number = await User.find({ number: req.body.number })
      if (email.length == 0) {
         if (number.length != 0) {
            req.session.message = "Number already exist"
            return res.redirect('/register')
         } else {
            try {
               await message.sentotp(req.session.storeuser.number)
               res.redirect('./otp')
            }
            catch {
               console.log("err")
            }
         }
      }
      else {
         req.session.message = "Email already exist"
         return res.redirect('/register')
      }
   },
   addUser: async (req, res) => {
      try {
         const storeuser = new User({
            username: req.session.storeuser.username,
            email: req.session.storeuser.email,
            number: req.session.storeuser.number,
            password: req.session.storeuser.password
         })
         const otp = req.body.otp

         if (otp.length == 0) {
            req.session.message = "Enter otp"
            return res.redirect('/otp')
         }
         else {
            const check = await message.check(otp, req.session.storeuser.number)
            if (check.status == "approved") {
               storeuser.password = await bcrypt.hash(storeuser.password, 10)
               await storeuser.save()

               req.session.message = ""
               res.redirect('./login',)
            }
            else {
               req.session.message = "Invalid otp"
               res.redirect('/otp')
            }
         }
      }
      catch (err) {
         console.log(err)

      }
   },

   resendOtp: async (req, res) => {
      try {
         await message.sentotp(req.session.storeuser.number)
         return res.redirect('/otp')
      }
      catch (err) {
         console.log(err);
      }
   },
   redirectHomepage: async (req, res) => {
      const user = await User.find({ email: req.body.email })
      const datapassword = user[0].password;
      
      if (user.length != 0) {
          const password1 = req.body.password
      const match = await bcrypt.compare(password1,datapassword)
         
         if (!match) {
            req.session.message = "password not correct"
            res.redirect('/login')
         }

         else if (user[0].isBlocked) {
            req.session.message = "User is Blocked"
            res.redirect('/login')
         }
         else {

            req.session.user = user[0]
            return res.redirect('/home')
         }
      }
      else {
         req.session.message = "Invalid User"
         res.redirect('/login',)
      }
   },

   getUserlogout: (req, res) => {
      req.session.user = null
      res.redirect('/login')
   },
   getProductdetails: (req, res) => {
      const user = User.findOne({id:req.session.user.id})
      return res.render('user/product-details',{user})
   },
   getDetailspage: async (req, res) => {
      try {
         const productId = req.params.id
         const product = await Products.findById(productId)
         return res.render('user/product-details', { product })
      }
      catch (err) {
         console.log(err)
      }

   },
   getCart: async (req, res) => {
      try {
         if (req.session.message) {
            const message = req.session.message
            req.session.message = ''
            const user = await User.findOne({ _id: req.session.user._id })
               .populate('cart.productId')
            const cart = user.cart
            message = ''

            return res.render('user/cart', { cart,user,message })
         }
         else {
            const user = await User.findOne({ _id: req.session.user._id })
               .populate('cart.productId')
            const cart = user.cart
            const message = ''
            return res.render('user/cart', { cart,user,message })
         }
      }

      catch (err) {
         console.log(err);
      }

   },
   addtoCart: async (req, res) => {
         const productId = req.body.id
         const user = await User.findOne({id :req.session.user.id})
      
         const pro = await User.find({_id :user._id,'cart.productId' : productId})
         const product =await Products.findById({_id : productId})
         let amount
         if(product.offer > 0){
         amount = (product.price-(product.price*product.offer/100))
         }else{
            amount = product.price
         }
         
         console.log(amount);
         try {

            if(pro.length>0){
               await User.findOneAndUpdate({ _id:user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity':+1, cartTotal :Math.round(amount)} })
            }
            else{
               const user = await User.findById(req.session.user._id)
               console.log(user)
               const product = await Products.findById(productId)
               console.log(product);
               let total
        if(product.offer>0){
     total =  Math.round( product.price-(product.price*product.offer/100))
        }else{
         total = product.price
        }
           
               const cartItem = {
                  productId: productId,
                  quantity: 1
               }
      
               const users = await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { cart: cartItem } })
               console.log(users)
               await User.findOneAndUpdate({ _id: req.session.user._id }, { $inc: {cartTotal: total} })
               res.json({
                  successStatus: true,
                  message: "Item added to cart successfully"
               })
            }
        

      } catch (error) {
         console.log(error)
         res.json({
            successStatus: false,
            message: "Some error occured. Please try again later"
         })

      }
   },
   removeCartItem: async (req, res) => {
      try {
         const user = req.session.user
         const productId = req.body.id
         console.log(req.body);
         console.log(productId);
         const product = await Products.findOne({ _id: productId })
         const userData = await User.findOne({ _id: user._id, })


         await User.findOneAndUpdate({ _id: user._id }, { $pull: { cart: { 'productId': productId } } })
         let quantity;
         userData.cart.forEach(item => {
            if (item.productId == productId) {
               quantity = item.quantity

            }
         })
         console.log("above quantity");
         console.log(quantity);
         const totalPrice = -product.price * quantity;
         await User.findOneAndUpdate({ _id: user._id }, { $inc: { cartTotal: totalPrice } })
         res.json({
            successStatus: true,
            message: " product removed from cart"
         })
      }

      catch (err) {
         console.log(err);
         res.json({
            successStatus: false,
            message: "Some error occured. Please try again later"
         })
      }
   },
   changeQuantity: async (req, res) => {
      try {
         let price
         let offer
         const product = await Products.findById(req.body.id)
          offer = Math.round( product.price*product.offer/100)
         
         if(product.offer>0){
            price = Math.round((product.price)-(product.price*product.offer/100))
            offer = Math.round( product.price*product.offer/100)
            console.log(offer+"with offer");
           
 }else{
            price = product.price
            offer = 0
            console.log(offer+"without offer");
         }
         const productId = req.body.id
         const user = await User.findById(req.session.user._id)
         let total = price * req.body.amount
         console.log(total+"price");
         let flag = true
         let quantity;
         let totalStoke = product.totalStoke
         console.log(totalStoke);
         user.cart.forEach(item => {
            if (item.productId == productId) {
               quantity = item.quantity
               if (item.quantity == 1 && req.body.amount < 0) {
                  flag = false

               }
            }
         })
          if (totalStoke - quantity <= 0 && req.body.amount > 0) {
            
          return res.json({ successStatus: false,
            totalStoke,
            quantity,
            totalamount : user.cartTotal + total,
            total,
            offer
          })
   
          }
          console.log((user.cartTotal+ total)+"amount")
         let newquantity = req.body.amount
         let count = quantity + req.body.amount
         let firstvalue = user.cartTotal

         if (flag) {
            await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity': newquantity, cartTotal: total} })
            return res.json({
               successStatus: true,
                count,
                totalamount : firstvalue + total,
                total,
                offer
            })

         }

         else {
            return res.json({
               successStatus: false
            })
         }


      }
      catch (err) {
         console.log(err);
         return res.json({
            successStatus: false
         })
      }
   },
   getadddetails: async (req, res) => {
      const user = await User.findById(req.session.user._id)
      const shippingAddress = user.shippingAddress
      return res.render('user/adddetails',{user,shippingAddress})
   },
   editUser: async (req, res) => {
      console.log("edit");
      try {
         

         const id = req.params.id
         const user = await User.findById(req.session.user.id)
         const updateUser = await User.findByIdAndUpdate({ _id: id }, req.body)
        
         return res.redirect('/adddetails')
      }
      catch (err) {
         console.log(err);
      }
   },
   getCheckout: async (req, res) => {
      try {
         let discount=[]
         if (req.session.message) {
            const user = await User.findOne({ _id: req.session.user._id })
               .populate('cart.productId')
            const cart = user.cart
            const shippingAddress = user.shippingAddress
            const message = req.session.message
            discount = req.session.addeddiscount
            console.log(discount)
            req.session.addeddiscount = 0
            req.session.message = ''
            return res.render('user/checkout', { cart, user, shippingAddress, message,discount})
         }
        if(req.session.addeddiscount){
         const user = await User.findOne({ _id: req.session.user._id })
         .populate('cart.productId')
      const cart = user.cart
      const shippingAddress = user.shippingAddress
      discount = req.session.addeddiscount
      console.log(discount)
      req.session.addeddiscount=0
      const message =''
      return res.render('user/checkout', { cart, user, shippingAddress, message,discount})
        }

         else {
            const user = await User.findOne({ _id: req.session.user._id })
               .populate('cart.productId')
            const cart = user.cart
            const shippingAddress = user.shippingAddress
            const message = ""
            discount = req.session.addeddiscount
            discount = {discount: 0}
            return res.render('user/checkout', { cart, user, shippingAddress, message,discount})
         }

      }
      catch (err) {
         console.log(err);
      }
   },
   getOrdersucces: (req, res) => {
      return res.render('user/ordersucces')
   },

   placeorderCod: async (req, res) => {
      const discount = req.params.discount
      console.log(discount +"is the discounted amount");
      if (!req.body.address) {
         req.session.message = "Please select a Address"
         res.redirect('/checkout')
      }
      else {
         try {
            const user = await User.findById(req.session.user._id)
               .populate('cart.productId')

         
            let address = []
            user.shippingAddress.forEach(item => {
               if (req.body.address == item._id) {
                  console.log(item);
                  address.push(item)

               }
            })
            const total = (user.cartTotal-discount)
            const order = new Orders({
               customerId: req.session.user._id,
               address: address,
               number: user.number,
               totalAmount: total,
               paymentMethod: "Cash On Delivery",
               paymentVerified: true,
            })
            // if(req.body.coupon){
            //    order.couponId = req.body.couponId
            //    const coupon = await Coupons.findById(req.body.couponId)
            //    if(coupon.users.includes(req.session.user._id)){
            //      return res.redirect('/checkout')
            //    }
            //    let discount;
              
            //      if(coupon.isPercentage){
            //        discount = total * coupon.discount/100
            //      }else{
            //        discount = coupon.discount
            //      }
            //      req.session.couponApplied = null
            //    }
            //    order.totalAmount = Math.round(total  - discount)
            //    await couponModel.findOneAndUpdate({_id: req.body.couponId}, {$push: {users: req.session.user._id}})
             


            user.cart.forEach(item => {
               const items = {
                  productId: item.productId._id,
                  productName: item.productId.productname,
                  color: item.productId.color,
                  size: item.productId.size,
                  quantity: item.quantity,
                  price: item.productId.price,
                  image: item.productId.images[0]
               }
               order.items.push(items)
            })

            await order.save()

            for (item of user.cart) {
               const productId = item.productId._id
               console.log(productId);
               const count = item.quantity
               console.log(count);
               await Products.findOneAndUpdate({ _id: productId }, { $inc: { totalStoke: -count } })
               await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $set: { cartTotal: 0 } })
               await User.findOneAndUpdate({ _id: user._id }, { $pull: { cart: { 'productId': productId } } })
            }
            await User.findOneAndUpdate({ _id: user._id }, { $inc: { totalSpent: (total-discount) } })
            return res.redirect('/payment/cod')

         }
         catch (err) {
            console.log(err);
         }
      }
   },
   placeorderRazorpay : async(req,res)=>{
      console.log("payment Started");
      if (!req.body.address) {
         req.session.message = "Please select a Address"
         res.redirect('/checkout')
      }
      else{
      let discount = req.body.discount
      const address = req.body.address
      console.log(address)
      console.log(discount +"the discount in razorpay")

         try{
            const user = await User.findById(req.session.user._id)
               .populate('cart.productId')

         let address = []
            user.shippingAddress.forEach(item => {
               if (req.body.address == item._id) {
                  console.log(item);
                  address.push(item)

               }
            })
             let total = -discount
              console.log (total+"discount")
                total = (total + user.cartTotal) 
             console.log(total+"cart amount");
            const order = new Orders({
               customerId: req.session.user._id,
               address: address,
               number: user.number,
               totalAmount: total,
               paymentMethod: "Razorpay",
               paymentVerified: false,
            })
  
            user.cart.forEach(item => {
               const items = {
                  productId: item.productId._id,
                  productName: item.productId.productname,
                  color: item.productId.color,
                  size: item.productId.size,
                  quantity: item.quantity,
                  price: item.productId.price,
                  image: item.productId.images[0],
                  orderStatus :'Pending'
               }
               order.items.push(items)
            })
            await order.save()

            const instance = new Razorpay({
               key_id: 'rzp_test_bVuwFNHsddTNfM',
               key_secret: '6ATU4CwacPgOWPolRfew3Ylm',
             })
             instance.orders.create({
               amount: order.totalAmount*100,
               currency: "INR",
               receipt: order._id.toString()
             }, (err, orderInstance) => {
               if(err){
                 console.log(err)
                 return res.json({successStatus: false})
               }
               console.log("order instance created");
               console.log(orderInstance)
               return res.json({
                 successStatus: true,
                 orderInstance,
                 user : user
               })
             })
         }
         catch(err){
            console.log(err)
            req.session.Errmessage = 'Some error occured please try again later'
    res.json({successStatus: false})
         }

      }
   },
//    placeorderPaypal: async(req,res)=>{
//  const request = new paypal.orders.OrdersCreateRequest()
 
 
//  const user = await User.findById(req.session.user._id)
//  .populate('cart.productId')

// let address = []
// user.shippingAddress.forEach(item => {
//  if (req.body.address == item._id) {
//     console.log(item);
//     address.push(item)
// }
// })
// const total = user.cartTotal
// const order = new Orders({
//    customerId: req.session.user._id,
//    address: address,
//    number: user.number,
//    totalAmount: total,
//    paymentMethod: "Paypal",
//    paymentVerified: false,
// })
// user.cart.forEach(item => {
//    const items = {
//       productId: item.productId._id,
//       productName: item.productId.productname,
//       color: item.productId.color,
//       size: item.productId.size,
//       quantity: item.quantity,
//       price: item.productId.price,
//       image: item.productId.images[0],
//       orderStatus :'Pending'
//    }
//    order.items.push(items)
// })
// await order.save()

// request.prefer("return-representation")
// request.requestBody({
//    intent :'CAPTURE',
//    purchase_units:[
// {
//    amount :{
//       currency_code: 'INR',
//       value : total,
//       breakdown:{
//          item_total:{
//             currency_code:'INR',
//             value : total
//          }
//       }
//    },
  
// }
//    ]
// })
// try{
// const order = await paypalClient.execute(request)
// res.json({
//    successStatus:true,
//    id :order.result.id})
// }catch(err){
// console.log(err);
// }
  
//    },

paypalPayment :async(req,res)=>{
   console.log("start 1")
   console.log(process.env.PAYPAL_CLIENT_ID);
   console.log(process.env.PAYPAL_CLIENT_SECRET);
   const request = new paypal.orders.OrdersCreateRequest()
  

   const user = await User.findById(req.session.user._id)
 .populate('cart.productId')
let discount = req.body.discount
console.log(discount+"discount of paypal");
let address = []
user.shippingAddress.forEach(item => {
 if (req.body.address == item._id) {
    console.log(item);
    address.push(item)
}

console.log("start 2");
})
let total = -discount
 console.log (total+"discount paypal")
total = (total + user.cartTotal) 
   console.log(total+"cart amount paypal");

console.log(total);
const order = new Orders({
   customerId: req.session.user._id,
   address: address,
   number: user.number,
   totalAmount: total,
   paymentMethod: "Paypal",
   paymentVerified: false,
})
let orderid
console.log("start 3");
user.cart.forEach(item => {
   const items = {
      productId: item.productId._id,
      productName: item.productId.productname,
      color: item.productId.color,
      size: item.productId.size,
      quantity: item.quantity,
      price: item.productId.price,
      image: item.productId.images[0],
      orderStatus :'Pending'
   }
   order.items.push(items)
    orderid = order.id
   
})
console.log("start 4");
await order.save()
request.prefer("return=representation")
request.requestBody({
   intent :'CAPTURE',
   purchase_units:[
{
   amount :{
      currency_code: 'USD',
      value : total,
      breakdown:{
         item_total:{
            currency_code:'USD',
            value : total
         }
      }
   },
 
}
   ]
})
console.log("start 5")
try{
   console.log(request)
const order = await paypalClient.execute(request)
console.log(order)
console.log("start 7")
res.json({
   id :order.result.id})
   const order1 = await Orders.find({id:orderid})
   console.log(order1);
  
await User.findOneAndUpdate({ _id: req.session.user._id },{$set:{ cartTotal: 0 }})
     
 await User.findOneAndUpdate({id:req.session.user.id},{$set:{cart:[],}})

}catch(err){
console.log(err);
}
  
   },
   getOrder: async (req, res) => {
      const user = await User.findById(req.session.user._id)
      const orders = await Orders.find({ customerId: req.session.user._id }).sort({createdAt:-1})
      return res.render('user/order-details', { orders, user })

   },
   getWishlist:async(req,res)=>{
    const user = await User.findById(req.session.user._id)
    .populate('wishlist.productId')
    const wishlist = user.wishlist
     return res.render('user/wishlist',{user,wishlist})
   },
   orderCancel: async (req, res) => {
      try {
         const id = req.body.id
         await Orders.findByIdAndUpdate({ _id: id }, {
            $set: { cancelled: true }
         })
         return res.json({
            successStatus: true
         })

      }
      catch (err) {

      }
   },
   getAddressadd :async(req,res)=>{
      if(req.session.message){
         const message = req.session.message
         req.session.message = ''
         const user = await User.findById(req.session.user)
     return res.render('user/address-editing',{user,message})
      }
      else{
         const message = ''
         const user = await User.findById(req.session.user)
         return res.render('user/address-editing',{user,message})
      }
  
   },
   addAddress:async(req,res)=>{
      try {
         if(!req.body.address){
            req.session.message = "Enter Address"
           return res.redirect ('/address/edit')}

           else if (!req.body.pincode) {
            req.session.message="Enter a pincode"
            return res.redirect ('/address/edit')
           }
         else{
            const address = {
               address: req.body.address,
               city: req.body.city,
               state: req.body.state,
               pincode: req.body.pincode
            }
   
            const id = req.params.id
            await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { shippingAddress: address } })
            return res.redirect('/adddetails')
         }
        
      }
      catch (err) {
         console.log(err);
      }
   },
   addtoWishlist: async (req,res)=>{
       const productId = req.body.id
       const user =  await User.findById(req.session.user._id)
       
       const pro = await User.find({_id :user._id,'wishlist.productId' : productId})

      try{
         if(pro.length>0){
            return res.json({
               successStatus: true
            })
         }
         else{
            const wishitem={
               productId :productId
             }
             await User.findOneAndUpdate({id : req.session.user._id},{$push:{wishlist :wishitem}})
             return res.json({
               successStatus: true
            })
         }
       

      }
      catch(err){
        console.log(err)
      }
   },
   removeWishItem: async(req,res)=>{
try{
   const user = req.session.user
   const productId = req.body.id

   await User.findOneAndUpdate({ _id: user._id }, { $pull: { wishlist: { 'productId': productId } } })
   return res.json({successStatus : true})
}catch(err){
   console.log(err)
}
   },
   getPaymentfail:(req,res)=>{
      return res.render('user/paymentfail')
   },
   paymentVerify : async (req,res)=>{
     
      try {
         console.log(req.body.payment)
         let hmac = crypto.createHmac('sha256', '6ATU4CwacPgOWPolRfew3Ylm' )
         hmac.update(req.body.payment['razorpay_order_id']+'|'+req.body.payment['razorpay_payment_id'])
         hmac = hmac.digest('hex')
         if(hmac == req.body.payment['razorpay_signature']){
           const order = await Orders.findOneAndUpdate({_id: req.body.order.receipt}, {
             $set: {
              orderStatus : 'Placed',
               paymentVerified: true
             }
           })
           for(let item of order.items){
            const productId = item.productId
            const count = item.quantity
            await Products.findOneAndUpdate({_id:productId},{$inc:{totalStoke : - count}})
            await User.findOneAndUpdate({ _id: req.session.user._id, 'cart.productId': productId },{$set:{ cartTotal: 0 }})
           }
           await User.findOneAndUpdate({id:req.session.user.id},{$set:{cart:[],}})
           

           const payment = new Payments({
            orderId: req.body.order.receipt,
            customerId: req.session.user._id,
            paymentId: req.body.payment['razorpay_payment_id'],
            razorpayOrderId: req.body.payment['razorpay_order_id'],
            paymentSignature: req.body.payment['razorpay_signature'],
            status: true
          })
          await payment.save()
          req.session.orderplaced = true
      req.session.couponApplied = null
      return res.json({successStatus: true})
     }
     else{
       await Orders.findOneAndUpdate({_id: req.body.order.receipt}, {
        $set: {
          cancelled: true
        }
      })
      return res.json({successStatus:false})
    } }
     catch(err){
      console.log(err)
     } 
   },
   paymentCancel:async(req,res)=>{
      try {
         const order = await Orders.findOneAndUpdate({_id: req.body.order.receipt}, {
           $set: {
             cancelled: true,
           }
         })
         res.json({successStatus: true})
       } catch (error) {
         console.log(error)
         res.json({successStatus: false})
       }
     },
     paymentFail: async(req,res)=>{
      try {
         const payment = new Payments({
           orderId: req.body.order.receipt,
           customerId: req.session.user._id,
           paymentId: req.body.payment.error.metadata['payment_id'],
           razorpayOrderId: req.body.payment.error.metadata['order_id'],
           status: false
         })
         await payment.save()
         const order = await orderModel.findOneAndUpdate({_id: req.body.order.receipt}, {
           $set: {
             cancelled: true,
           }
         })
         console.log(order)
         res.json({successStatus: true})
       } catch (error) {
         console.log(error)
       }
      
     },
     addtoCartfromWish:async(req,res)=>{
      
         const user = await User.findOne({_id:req.session.user._id})
         const productId = req.body.id
         const pro = await User.find({_id :user._id,'cart.productId' : productId})
         const product =await Products.findById({_id : productId})

         let amount
         if(product.offer > 0){
         amount = ( Math.round( product.price-(product.price*product.offer/100)))
         }else{
            amount = product.price
         }
         console.log(amount);
         try {

            if(pro.length>0){
               await User.findOneAndUpdate({ _id:user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity':+1, cartTotal :amount} })
               await User.findOneAndUpdate({_id:req.session.user._id},{$pull: { wishlist: { 'productId': productId } }})
               res.json({
                  successStatus: true,
                  message: "Item added to cart successfully"
               })
            }
            else{
               const user = await User.findById(req.session.user._id)
               console.log(user)
               const product = await Products.findById(productId)
               console.log(product);
      
               let total
               if(product.offer>0){
            total =  Math.round( product.price-(product.price*product.offer/100))
               }else{
                total = product.price
               }
               const cartItem = {
                  productId: productId,
                  quantity: 1
               }
      
               const users = await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { cart: cartItem } })
               console.log(users)
               await User.findOneAndUpdate({ _id: req.session.user._id }, { $inc: {cartTotal: total} })
               await User.findOneAndUpdate({_id:req.session.user._id},{$pull: { wishlist: { 'productId': productId } }})
               res.json({
                  successStatus: true,
                  message: "Item added to cart successfully"
               })
            }


      }
      
    
    catch(err){
      console.log(err)
   }},
   addCoupon:async(req,res)=>{
     try{
      const coupon = req.body.coupon
      console.log(coupon+"sdfghj");
      const user = await User.findOne({_id:req.session.user._id})
      .populate('cart.productId')
      const coupon1 = await Coupons.find({coupon:req.body.coupon})
      console.log(coupon1);
      const total = user.cartTotal
      console.log(coupon1[0].discount)


      if(coupon1[0].users.includes(req.session.user._id)){
         return res.json({
           successStatus: false,
           message: 'You have already used the coupon'
         })
       }


       let discount
      if(coupon1[0].isPercentage){
        discount = total*coupon1[0].discount/100
      }
      else{
      discount = (coupon1[0].discount)
      }
    
      console.log(discount);
      req.session.addeddiscount = {
         discount,
         couponId :coupon1[0].id,
         coupon: coupon1[0].coupon
       }
       console.log(req.session.addeddiscount);
       const discountprice = total-discount
    
   
      await Coupons.findOneAndUpdate({coupon:req.body.coupon},{$push:{users : req.session.user._id}})
      console.log("sucess");
      res.json({
     successStatus :true,
      discountprice,
      discount
      })
     }
     catch(err){
      console.log(err);
      res.json({
         successStatus:false
      })
     }

   },
   getForgetPassword:async(req,res)=>{
      if(req.session.message){
         const message = req.session.message
         req.session.message = ''
         return res.render('user/forget-password',{message})
      }
      const message =""
      return res.render('user/forget-password',{message})
   },
   forgotPassword:async(req,res)=>{
try{
      const mobilenumber = req.body.number
      req.session.mobilenumber = mobilenumber
      console.log(mobilenumber)
      const number = await User.find({number:req.body.number})
      if(!req.body.number){
         req.session.message= "Enter a Mobile Number"
         return res.redirect('/forgot-password')
      }
      else if(!/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/.test(String(mobilenumber))){
        req.session.message = "Enter a valid Mobile Number"
        return res.redirect('/forgot-password')
      }
      else if(number.length <= 0){
         req.session.message="Enter registered mobile number"
         return res.redirect('/forgot-password')
      }
      else if(number.length>0){
         await message.sentotp(mobilenumber)
         res.redirect('/otpforgot')
      }
   }
catch(err){
   console.log(err);
}
      
},
getOtpforgot:(req,res)=>{
   return res.render('user/otp-forgot')
},
checkForgot:async(req,res)=>{
 const otp = req.body.otp

 if(otp.length == 0){
   req.session.message="Enter otp"
   return res.redirect('/otpforgot')
 }
 else{
   const check = await message.check(otp,req.session.mobilenumber)
   if (check.status == "approved") {
      req.session.message = ""
      return res.redirect('/edit-password')
   }
   else{
      req.session.message = "Invalid Otp"
      return res.redirect('/otpforgot')
   }
 }
},
getEditPassword:(req,res)=>{
   return res.render('user/edit-password')
},
editPassword:async(req,res)=>{
   try{
   const newpassword = req.body.newpassword
   const password = await bcrypt.hash(newpassword, 10)
   console.log(password);
   await User.findOneAndUpdate({number :req.session.mobilenumber},{$set:{password :password}})
   res.redirect('/login')
   
   }
   catch(err){
      console.log(err);
   }
   },
   deleteAddress: async(req,res)=>{
      try{
         console.log("delete address");
      const user = await User.find({_id : req.session.user._id})
       const id = req.body.id
      console.log(id)
      const addressId = req.body.addressId
      console.log(addressId);
      
   await User.findOneAndUpdate({ _id: req.session.user._id }, { $pull: { shippingAddress: { '_id': addressId } } })
      res.json({
         successStatus:true
      })

      }
      catch(err){
         res.json({
            successStatus:false
         })
 console.log(err);
      }
   }
}

    

 
 



