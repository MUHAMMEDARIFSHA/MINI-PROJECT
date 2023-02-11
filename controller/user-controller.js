
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

      if (user.length != 0) {
         const match = bcrypt.compare(req.body.password, user[0].password)
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
         const amount = product.price
         console.log(amount);
         try {

            if(pro.length>0){
               await User.findOneAndUpdate({ _id:user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity':+1, cartTotal :amount} })
            }
            else{
               const user = await User.findById(req.session.user._id)
               console.log(user)
               const product = await Products.findById(productId)
               console.log(product);
      
               const total = product.price
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
         const product = await Products.findById(req.body.id)
         const productId = req.body.id
         const user = await User.findById(req.session.user._id)
         let total = product.price * req.body.amount
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
            req.session.message = "Out of Stock"
            let message = req.session.message
            req.session.message = ''
            return res.json({ successStatus: false, message })
         }

         let newquantity = req.body.amount
         let count = quantity + req.body.amount


         console.log(count)
         if (flag) {
            await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity': newquantity, cartTotal: total } })
            return res.json({
               successStatus: true,
               quantity: count,

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
      return res.render('user/adddetails',{user})
   },
   editUser: async (req, res) => {
      console.log("edit");
      try {
         const address = {
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
         }

         const id = req.params.id
         const user = await User.findById(req.session.user.id)
         const updateUser = await User.findByIdAndUpdate({ _id: id }, req.body)
         await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { shippingAddress: address } })
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
            req.session.addeddiscount= 0
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
      req.session.addeddiscount= 0
      const message =''
      return res.render('user/checkout', { cart, user, shippingAddress, message,discount})
        }

         else {
            const user = await User.findOne({ _id: req.session.user._id })
               .populate('cart.productId')
            const cart = user.cart
            const shippingAddress = user.shippingAddress
            const message = ""
            discount = {discount: 0}
            return res.render('user/checkout', { cart, user, shippingAddress, message,discount })
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
            const total = user.cartTotal
            const order = new Orders({
               customerId: req.session.user._id,
               address: address,
               number: user.number,
               totalAmount: total,
               paymentMethod: "Cash On Delivery",
               paymentVerified: true,
            })

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
            await User.findOneAndUpdate({ _id: user._id }, { $inc: { totalSpent: total } })
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

      const address = req.body.address
      console.log(address)
      
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

            const total = user.cartTotal
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
   getOrder: async (req, res) => {
      const user = await User.findById(req.session.user._id)
      const orders = await Orders.find({ customerId: req.session.user._id })
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
            return res.redirect('/checkout')
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
         const amount = product.price
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
      
               const total = product.price
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

   }
}

    

 
   


