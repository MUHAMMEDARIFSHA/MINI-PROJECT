/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable func-call-spacing */
const User = require('../models/user')
const Products = require('../models/products')
const Orders = require('../models/order')
const Razorpay = require ('razorpay')
const Payments = require('../models/payment')
const crypto = require('crypto')
const Coupons = require('../models/coupon')
const paypal = require('@paypal/checkout-server-sdk')
const Environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
const paypalClient = new paypal.core.PayPalHttpClient(Environment)

module.exports = {
  getOrdersucces: (req, res) => {
    return res.render('user/ordersucces')
  },

  getPaymentfail: (req, res) => {
    return res.render('user/paymentfail')
  },

  placeorderCod: async (req, res) => {
    const discount = req.params.discount
    console.log(discount + 'is the discounted amount')
    if (!req.body.address) {
      req.session.message = 'Please select a Address'
      res.redirect('/checkout')
    } else {
      try {
        const user = await User.findById(req.session.user._id)
          .populate('cart.productId')

        const address = []
        user.shippingAddress.forEach(item => {
          if (req.body.address == item._id) {
            console.log(item)
            address.push(item)
          }
        })
        const total = (user.cartTotal - discount)
        const order = new Orders({
          customerId: req.session.user._id,
          address,
          number: user.number,
          totalAmount: total,
          paymentMethod: 'Cash On Delivery',
          paymentVerified: true
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

        for (const item of user.cart) {
          const productId = item.productId._id
          console.log(productId)
          const count = item.quantity
          console.log(count)
          await Products.findOneAndUpdate({ _id: productId }, { $inc: { totalStoke: -count } })
          await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $set: { cartTotal: 0 } })
          await User.findOneAndUpdate({ _id: user._id }, { $pull: { cart: { productId } } })
        }
        await User.findOneAndUpdate({ _id: user._id }, { $inc: { totalSpent: (total - discount) } })
        return res.redirect('/payment/cod')
      } catch (err) {
        console.log(err)
      }
    }
  },

  placeorderRazorpay: async (req, res) => {
    console.log('payment Started')
    if (!req.body.address) {
      req.session.message = 'Please select a Address'
      res.redirect('/checkout')
    } else {
      const discount = req.body.discount
      const address = req.body.address
      console.log(address)
      console.log(discount + 'the discount in razorpay')

      try {
        const user = await User.findById(req.session.user._id)
          .populate('cart.productId')

        const address = []
        user.shippingAddress.forEach(item => {
          if (req.body.address == item._id) {
            console.log(item)
            address.push(item)
          }
        })
        let total = -discount
        console.log (total + 'discount')
        total = (total + user.cartTotal)
        console.log(total + 'cart amount')
        const order = new Orders({
          customerId: req.session.user._id,
          address,
          number: user.number,
          totalAmount: total,
          paymentMethod: 'Razorpay',
          paymentVerified: false
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
            orderStatus: 'Pending'
          }
          order.items.push(items)
        })
        await order.save()

        const instance = new Razorpay({
          key_id: 'rzp_test_bVuwFNHsddTNfM',
          key_secret: '6ATU4CwacPgOWPolRfew3Ylm'
        })
        instance.orders.create({
          amount: order.totalAmount * 100,
          currency: 'INR',
          receipt: order._id.toString()
        }, (err, orderInstance) => {
          if (err) {
            console.log(err)
            return res.json({ successStatus: false })
          }
          console.log('order instance created')
          console.log(orderInstance)
          return res.json({
            successStatus: true,
            orderInstance,
            user
          })
        })
      } catch (err) {
        console.log(err)
        req.session.Errmessage = 'Some error occured please try again later'
        res.json({ successStatus: false })
      }
    }
  },

  paypalPayment: async (req, res) => {
    console.log('start 1')
    console.log(process.env.PAYPAL_CLIENT_ID)
    console.log(process.env.PAYPAL_CLIENT_SECRET)
    const request = new paypal.orders.OrdersCreateRequest()

    const user = await User.findById(req.session.user._id)
      .populate('cart.productId')
    const discount = req.body.discount

    const address = []
    user.shippingAddress.forEach(item => {
      if (req.body.address == item._id) {
        console.log(item)
        address.push(item)
      }
    })
    let total = -discount
    console.log (total + 'discount paypal')
    total = (total + user.cartTotal)
    console.log(total + 'cart amount paypal')

    console.log(total)
    const order = new Orders({
      customerId: req.session.user._id,
      address,
      number: user.number,
      totalAmount: total,
      paymentMethod: 'Paypal',
      paymentVerified: false
    })
    let orderid

    user.cart.forEach(item => {
      const items = {
        productId: item.productId._id,
        productName: item.productId.productname,
        color: item.productId.color,
        size: item.productId.size,
        quantity: item.quantity,
        price: item.productId.price,
        image: item.productId.images[0],
        orderStatus: 'Pending'
      }
      order.items.push(items)
      orderid = order.id
    })

    await order.save()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: total
              }
            }
          }

        }
      ]
    })
    try {
      console.log(request)
      const order = await paypalClient.execute(request)
      console.log(order)
      res.json({ id: order.result.id })
      const order1 = await Orders.find({ id: orderid })
      console.log(order1)

      await User.findOneAndUpdate({ _id: req.session.user._id }, { $set: { cartTotal: 0 } })

      await User.findOneAndUpdate({ id: req.session.user.id }, { $set: { cart: [] } })
    } catch (err) {
      console.log(err)
    }
  }

}
