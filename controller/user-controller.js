/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable eqeqeq */

const User = require('../models/user')
const message = require('../twilio')
const bcrypt = require('bcrypt')
const Products = require('../models/products')
const Orders = require('../models/order')
const Razorpay = require('razorpay')
const Payments = require('../models/payment')
const Categories = require('../models/category')
const crypto = require('crypto')

const Coupons = require('../models/coupon')
const paypal = require('@paypal/checkout-server-sdk')
const { default: mongoose } = require('mongoose')
const Environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
const paypalClient = new paypal.core.PayPalHttpClient(Environment)

module.exports = {

  getLogin: (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      return res.render('login', { message })
    } else {
      const message = ''
      return res.render('login', { message })
    }
  },

  getRegister: (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      return res.render('register', { message })
    } else {
      const message = ''
      return res.render('register', { message })
    }
  },
  getLandingpage: async (req, res) => {
    const products = await Products.find({ isDeleted: false })

    return res.render('landingpage', { products })
  },
  getHomepage: async (req, res) => {
    const products = await Products.find({ isDeleted: false }).populate('categoryId')
    const user = await User.find({ isBlocked: false })
    const category = await Categories.find({ isDeleted: false })
    return res.render('userhome', { products, user, category })
  },
  getOtp: (req, res) => {
    return res.render('otp')
  },

  saveUser: async (req, res) => {
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
        req.session.message = 'Number already exist'
        return res.redirect('/register')
      } else {
        try {
          await message.sentotp(req.session.storeuser.number)
          res.redirect('./otp')
        } catch {
          console.log('err')
        }
      }
    } else {
      req.session.message = 'Email already exist'
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
        req.session.message = 'Enter otp'
        return res.redirect('/otp')
      } else {
        const check = await message.check(otp, req.session.storeuser.number)
        if (check.status == 'approved') {
          await storeuser.save()
          req.session.message = ''
          res.redirect('./login')
        } else {
          req.session.message = 'Invalid otp'
          res.redirect('/otp')
        }
      }
    } catch (err) {
      console.log(err)
    }
  },

  resendOtp: async (req, res) => {
    try {
      await message.sentotp(req.session.storeuser.number)
      return res.redirect('/otp')
    } catch (err) {
      console.log(err)
    }
  },
  redirectHomepage: async (req, res) => {
    const user = await User.find({ email: req.body.email })
    const datapassword = user[0].password

    if (user.length != 0) {
      const password1 = req.body.password
      const match = await bcrypt.compare(password1, datapassword)

      if (!match) {
        req.session.message = 'password not correct'
        res.redirect('/login')
      } else if (user[0].isBlocked) {
        req.session.message = 'User is Blocked'
        res.redirect('/login')
      } else {
        req.session.user = user[0]
        return res.redirect('/home')
      }
    } else {
      req.session.message = 'Invalid User'
      res.redirect('/login')
    }
  },

  getUserlogout: (req, res) => {
    req.session.user = ''
    res.redirect('/login')
  },
  getProductdetails: (req, res) => {
    const user = User.findOne({ id: req.session.user.id })
    return res.render('user/product-details', { user })
  },
  getDetailspage: async (req, res) => {
    try {
      const productId = req.params.id
      const product = await Products.findById(productId)
      return res.render('user/product-details', { product })
    } catch (err) {
      console.log(err)
    }
  },

  getadddetails: async (req, res) => {
    const user = await User.findById(req.session.user._id)
    const shippingAddress = user.shippingAddress
    return res.render('user/adddetails', { user, shippingAddress })
  },
  editUser: async (req, res) => {
    console.log('edit')
    try {
      const edituser = ({
        username: req.body.username,
        email: req.body.email,
        number: req.body.number

      })
      req.session.edituser = edituser
      const number = req.body.number
      console.log(number)
      req.session.otpnumber = number
      await message.sentotp(number)

      return res.redirect('/otpedit')
    } catch (err) {
      console.log(err)
    }
  },
  editUserwithOtp: async (req, res) => {
    try {
      const otp = req.body.otp
      if (otp.length == 0) {
        req.session.message = 'Enter otp'
        return res.redirect('/otp')
      } else {
        const check = await message.check(otp, req.session.otpnumber)
        console.log(req.session.otpnumber + 'otp snt number')
        if (check.status == 'approved') {
          await User.findByIdAndUpdate({ _id: req.session.user._id }, req.session.edituser)

          req.session.edituser = ''
          req.session.otpnumber = ''
          req.session.message = ''
          return res.redirect('/adddetails')
        } else {
          req.session.message = 'Invalid otp'
          res.redirect('/otpedit')
        }
      }
    } catch (err) {
      console.log(err)
    }
  },

  getOrder: async (req, res) => {
    const user = await User.findById(req.session.user._id)
    const orders = await Orders.find({ customerId: req.session.user._id }).sort({ createdAt: -1 })
    return res.render('user/order-details', { orders, user })
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
    } catch (err) {

    }
  },
  getAddressadd: async (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      const user = await User.findById(req.session.user)
      return res.render('user/address-editing', { user, message })
    } else {
      const message = ''
      const user = await User.findById(req.session.user)
      return res.render('user/address-editing', { user, message })
    }
  },
  addAddress: async (req, res) => {
    try {
      if (!req.body.address) {
        req.session.message = 'Enter Address'
        return res.redirect('/address/edit')
      } else if (!req.body.pincode) {
        req.session.message = 'Enter a pincode'
        return res.redirect('/address/edit')
      } else {
        const address = {
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode
        }

        await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { shippingAddress: address } })
        return res.redirect('/adddetails')
      }
    } catch (err) {
      console.log(err)
    }
  },

  paymentVerify: async (req, res) => {
    try {
      console.log(req.body.payment)
      let hmac = crypto.createHmac('sha256', '6ATU4CwacPgOWPolRfew3Ylm')
      hmac.update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id)
      hmac = hmac.digest('hex')
      if (hmac == req.body.payment.razorpay_signature) {
        const order = await Orders.findOneAndUpdate({ _id: req.body.order.receipt }, {
          $set: {
            orderStatus: 'Placed',
            paymentVerified: true
          }
        })
        for (const item of order.items) {
          const productId = item.productId
          const count = item.quantity
          await Products.findOneAndUpdate({ _id: productId }, { $inc: { totalStoke: -count } })
          await User.findOneAndUpdate({ _id: req.session.user._id, 'cart.productId': productId }, { $set: { cartTotal: 0 } })
        }
        await User.findOneAndUpdate({ id: req.session.user.id }, { $set: { cart: [] } })

        const payment = new Payments({
          orderId: req.body.order.receipt,
          customerId: req.session.user._id,
          paymentId: req.body.payment.razorpay_payment_id,
          razorpayOrderId: req.body.payment.razorpay_order_id,
          paymentSignature: req.body.payment.razorpay_signature,
          status: true
        })
        await payment.save()
        req.session.orderplaced = true
        req.session.couponApplied = null
        return res.json({ successStatus: true })
      } else {
        await Orders.findOneAndUpdate({ _id: req.body.order.receipt }, {
          $set: {
            cancelled: true
          }
        })
        return res.json({ successStatus: false })
      }
    } catch (err) {
      console.log(err)
    }
  },
  paymentCancel: async (req, res) => {
    try {
      await Orders.findOneAndUpdate({ _id: req.body.order.receipt }, {
        $set: {
          cancelled: true
        }
      })
      res.json({ successStatus: true })
    } catch (error) {
      console.log(error)
      res.json({ successStatus: false })
    }
  },
  paymentFail: async (req, res) => {
    try {
      const payment = new Payments({
        orderId: req.body.order.receipt,
        customerId: req.session.user._id,
        paymentId: req.body.payment.error.metadata.payment_id,
        razorpayOrderId: req.body.payment.error.metadata.order_id,
        status: false
      })
      await payment.save()
      const order = await Orders.findOneAndUpdate({ _id: req.body.order.receipt }, {
        $set: {
          cancelled: true
        }
      })
      console.log(order)
      res.json({ successStatus: true })
    } catch (error) {
      console.log(error)
    }
  },

  addCoupon: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.session.user._id })
        .populate('cart.productId')
      const coupon1 = await Coupons.find({ coupon: req.body.coupon })
      console.log(coupon1)
      const total = user.cartTotal
      console.log(coupon1[0].discount)

      if (coupon1[0].users.includes(req.session.user._id)) {
        return res.json({
          successStatus: false,
          message: 'You have already used the coupon'
        })
      }

      let discount
      if (coupon1[0].isPercentage) {
        discount = total * coupon1[0].discount / 100
      } else {
        discount = (coupon1[0].discount)
      }

      console.log(discount)
      req.session.addeddiscount = {
        discount,
        couponId: coupon1[0].id,
        coupon: coupon1[0].coupon
      }
      console.log(req.session.addeddiscount)
      const discountprice = total - discount

      await Coupons.findOneAndUpdate({ coupon: req.body.coupon }, { $push: { users: req.session.user._id } })
      console.log('sucess')
      res.json({
        successStatus: true,
        discountprice,
        discount
      })
    } catch (err) {
      console.log(err)
      res.json({
        successStatus: false
      })
    }
  },
  getForgetPassword: async (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      return res.render('user/forget-password', { message })
    }
    const message = ''
    return res.render('user/forget-password', { message })
  },
  forgotPassword: async (req, res) => {
    try {
      const mobilenumber = req.body.number
      req.session.mobilenumber = mobilenumber
      console.log(mobilenumber)
      const number = await User.find({ number: req.body.number })
      if (!req.body.number) {
        req.session.message = 'Enter a Mobile Number'
        return res.redirect('/forgot-password')
      } else if (!/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/.test(String(mobilenumber))) {
        req.session.message = 'Enter a valid Mobile Number'
        return res.redirect('/forgot-password')
      } else if (number.length <= 0) {
        req.session.message = 'Enter registered mobile number'
        return res.redirect('/forgot-password')
      } else if (number.length > 0) {
        await message.sentotp(mobilenumber)
        res.redirect('/otpforgot')
      }
    } catch (err) {
      console.log(err)
    }
  },
  getOtpforgot: (req, res) => {
    return res.render('user/otp-forgot')
  },
  checkForgot: async (req, res) => {
    const otp = req.body.otp

    if (otp.length == 0) {
      req.session.message = 'Enter otp'
      return res.redirect('/otpforgot')
    } else {
      const check = await message.check(otp, req.session.mobilenumber)
      if (check.status == 'approved') {
        req.session.message = ''
        return res.redirect('/edit-password')
      } else {
        req.session.message = 'Invalid Otp'
        return res.redirect('/otpforgot')
      }
    }
  },
  getEditPassword: (req, res) => {
    return res.render('user/edit-password')
  },
  editPassword: async (req, res) => {
    try {
      const newpassword = req.body.newpassword
      const password = await bcrypt.hash(newpassword, 10)
      console.log(password)
      await User.findOneAndUpdate({ number: req.session.mobilenumber }, { $set: { password } })
      res.redirect('/login')
    } catch (err) {
      console.log(err)
    }
  },
  deleteAddress: async (req, res) => {
    try {
      console.log('delete address')

      const id = req.body.id
      console.log(id)
      const addressId = req.body.addressId
      console.log(addressId)

      await User.findOneAndUpdate({ _id: req.session.user._id }, { $pull: { shippingAddress: { _id: addressId } } })
      res.json({
        successStatus: true
      })
    } catch (err) {
      res.json({
        successStatus: false
      })
      console.log(err)
    }
  },
  getOtpEdit: (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      res.render('user/otp-edit', { message })
    } else {
      const message = ''
      res.render('user/otp-edit', { message })
    }
  },
  getViewOrderDetails: async (req, res) => {
    const orderId = req.session.orderId
    const product = await Orders.find({ _id: orderId }).populate('customerId')
    console.log(product + 'the details of order')
    req.session.orderId = ''
    return res.render('user/order-product', { product })
  },

  viewOrderDetails: async (req, res) => {
    const id = req.body.id
    console.log(id)
    const product = await Orders.find({ _id: id })
    console.log(product)
    req.session.orderId = id
    return res.json({
      successStatus: true,
      product,
      redirect: '/user/order-product'
    })
  },

  getShop: async (req, res) => {
    try {
      let searchWord
      let products
      let user
      let category = await Categories.find({ isDeleted: false })
      const categoryForfilter = []

      const perPage = 4
      const page = req.session.page || 1
      const totalCount = await Products.aggregate(
        [
          {
            $match:

                {
                  isDeleted: false
                }
          },
          {
            $count:
                'productname'
          }
        ])
      console.log(totalCount[0].productname)

      const pages = Math.ceil((totalCount[0].productname) / perPage)

      const from = req.session.from || 0
      const to = req.session.to || 100000
      console.log(from, to + 'in filter')
      if (req.session.searchWord.length > 0) {
        user = await User.find({ isBlocked: false })
        category = await Categories.find({ isDeleted: false })
        searchWord = req.session.searchWord
        req.session.searchWord = ''
        products = await Products.aggregate([
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'categoryId'
            }
          },
          {
            $unwind: '$categoryId'
          },

          {
            $match: {
              isDeleted: false
            }
          },
          {
            $match: {
              $or: [
                { productname: new RegExp(searchWord, 'i') },
                { color: new RegExp(searchWord, 'i') },
                { 'categoryId.categoryname': new RegExp(searchWord, 'i') }
              ]
            }
          }
        ]).skip((page - 1) * perPage).limit(perPage)
      } else if (req.session.productCategory) {
        console.log('category filter')
        req.session.productCategory.forEach(item => {
          categoryForfilter.push(mongoose.Types.ObjectId(item))
          console.log(category + 'after filter')
        })
        req.session.productCategory = null
        products = await Products.aggregate([
          {
            $match: {
              isDeleted: false,
              categoryId: { $in: categoryForfilter }
            }
          },
          {
            $sort: {
              categoryId: 1
            }
          }

        ]).skip((page - 1) * perPage).limit(perPage)
      } else if (req.session.from || req.session.to) {
        console.log('price filter')
        req.session.from = null
        req.session.to = null
        req.session.productCategory = null
        products = await Products.aggregate([

          {
            $match: {
              isDeleted: false,
              $and: [
                { price: { $gte: parseInt(from) } },
                { price: { $lte: parseInt(to) } }
              ]

            }
          },
          {
            $sort: {
              categoryId: 1
            }
          }
        ]).skip((page - 1) * perPage).limit(perPage)
      } else {
        console.log('normalshop')
        products = await Products.find({ isDeleted: false }).populate('categoryId').skip((page - 1) * perPage).limit(perPage)

        category = await Categories.find({ isDeleted: false })

        user = await User.find({ isBlocked: false })
      }

      return res.render('user/shop', { products, user, category, pages })
    } catch (err) {
      console.log(err)
    }
  },

  Search: (req, res) => {
    const searchWord = req.query.search.replace(/[^a-zA-Z0-9 ]/g, '')
    req.session.searchWord = searchWord
    res.redirect('/shop')
  },

  filterProducts: (req, res) => {
    req.session.from = req.query.from
    req.session.to = req.query.to
    console.log(req.session.to, req.session.from)
    req.session.productCategory = req.query.category

    console.log(req.session.productCategory + 'product category')
    res.redirect('/shop')
  },

  changePage: async (req, res) => {
    const user = req.session.user
    const category = await Categories.find({ isDeleted: false })
    const page = req.query.page
    console.log(page + 'pagination')
    req.session.page = page
    console.log(req.session.page + 'p')
    let products
    let pages
    if (req.session.page) {
      const page = req.session.page
      const perPage = 4
      products = await Products.find({ isDeleted: false }).skip((page - 1) * perPage).limit(perPage)
      const totalCount = await Products.aggregate(
        [
          {
            $match:

                      {
                        isDeleted: false
                      }
          },
          {
            $count:
                      'productname'
          }
        ])
      console.log(totalCount[0].productname)

      pages = Math.ceil((totalCount[0].productname) / perPage)
    }

    return res.render('user/shop', { products, user, category, pages })
  }

}
