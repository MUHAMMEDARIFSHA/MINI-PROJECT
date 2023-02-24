/* eslint-disable eqeqeq */
const User = require('../models/user')
const Products = require('../models/products')

module.exports = {
  getCart: async (req, res) => {
    try {
      if (req.session.message) {
        const message = req.session.message
        req.session.message = ''
        const user = await User.findOne({ _id: req.session.user._id })
          .populate('cart.productId')
        const cart = user.cart

        return res.render('user/cart', { cart, user, message })
      } else {
        const user = await User.findOne({ _id: req.session.user._id })
          .populate('cart.productId')
        const cart = user.cart
        const message = ''
        return res.render('user/cart', { cart, user, message })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getWishlist: async (req, res) => {
    const user = await User.findById(req.session.user._id)
      .populate('wishlist.productId')
    const wishlist = user.wishlist
    return res.render('user/wishlist', { user, wishlist })
  },
  getCheckout: async (req, res) => {
    try {
      let discount = []
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
        return res.render('user/checkout', { cart, user, shippingAddress, message, discount })
      }
      if (req.session.addeddiscount) {
        const user = await User.findOne({ _id: req.session.user._id })
          .populate('cart.productId')
        const cart = user.cart
        const shippingAddress = user.shippingAddress
        discount = req.session.addeddiscount
        console.log(discount)
        req.session.addeddiscount = 0
        const message = ''
        return res.render('user/checkout', { cart, user, shippingAddress, message, discount })
      } else {
        const user = await User.findOne({ _id: req.session.user._id })
          .populate('cart.productId')
        const cart = user.cart
        const shippingAddress = user.shippingAddress
        const message = ''
        discount = req.session.addeddiscount
        discount = { discount: 0 }
        return res.render('user/checkout', { cart, user, shippingAddress, message, discount })
      }
    } catch (err) {
      console.log(err)
    }
  },
  addtoCart: async (req, res) => {
    const productId = req.body.id
    const user = await User.findOne({ id: req.session.user.id })

    const pro = await User.find({ _id: user._id, 'cart.productId': productId })
    const product = await Products.findById({ _id: productId })
    let amount
    if (product.offer > 0) {
      amount = (product.price - (product.price * product.offer / 100))
    } else {
      amount = product.price
    }

    console.log(amount)
    try {
      if (pro.length > 0) {
        await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity': +1, cartTotal: Math.round(amount) } })
      } else {
        const user = await User.findById(req.session.user._id)
        console.log(user)
        const product = await Products.findById(productId)
        console.log(product)
        let total
        if (product.offer > 0) {
          total = Math.round(product.price - (product.price * product.offer / 100))
        } else {
          total = product.price
        }

        const cartItem = {
          productId,
          quantity: 1
        }

        const users = await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { cart: cartItem } })
        console.log(users)
        await User.findOneAndUpdate({ _id: req.session.user._id }, { $inc: { cartTotal: total } })
        res.json({
          successStatus: true,
          message: 'Item added to cart successfully'
        })
      }
    } catch (error) {
      console.log(error)
      res.json({
        successStatus: false,
        message: 'Some error occured. Please try again later'
      })
    }
  },
  removeCartItem: async (req, res) => {
    try {
      const user = req.session.user
      const productId = req.body.id
      console.log(req.body)
      console.log(productId)
      const product = await Products.findOne({ _id: productId })
      const userData = await User.findOne({ _id: user._id })

      await User.findOneAndUpdate({ _id: user._id }, { $pull: { cart: { productId } } })
      let quantity
      userData.cart.forEach(item => {
        if (item.productId == productId) {
          quantity = item.quantity
        }
      })
      console.log('above quantity')
      console.log(quantity)
      let price
      if (product.offer > 0) {
        price = Math.round((product.price) - (product.price * (product.offer / 100)))
      } else {
        price = product.price
      }
      const totalPrice = -price * quantity
      await User.findOneAndUpdate({ _id: user._id }, { $inc: { cartTotal: Math.round(totalPrice) } })
      res.json({
        successStatus: true,
        message: ' product removed from cart'
      })
    } catch (err) {
      console.log(err)
      res.json({
        successStatus: false,
        message: 'Some error occured. Please try again later'
      })
    }
  },
  changeQuantity: async (req, res) => {
    try {
      let price
      let offer
      const product = await Products.findById(req.body.id)
      offer = Math.round(product.price * product.offer / 100)

      if (product.offer > 0) {
        price = Math.round((product.price) - (product.price * product.offer / 100))
        offer = Math.round(product.price * product.offer / 100)
        console.log(offer + 'with offer')
      } else {
        price = product.price
        offer = 0
        console.log(offer + 'without offer')
      }
      const productId = req.body.id
      const user = await User.findById(req.session.user._id)
      const total = price * req.body.amount
      console.log(total + 'price')
      let flag = true
      let quantity
      const totalStoke = product.totalStoke
      console.log(totalStoke)
      user.cart.forEach(item => {
        if (item.productId == productId) {
          quantity = item.quantity
          if (item.quantity == 1 && req.body.amount < 0) {
            flag = false
          }
        }
      })
      if (totalStoke - quantity <= 0 && req.body.amount > 0) {
        return res.json({
          successStatus: false,
          totalStoke,
          quantity,
          totalamount: user.cartTotal + total,
          total,
          offer
        })
      }
      console.log((user.cartTotal + total) + 'amount')
      const newquantity = req.body.amount
      const count = quantity + req.body.amount
      const firstvalue = user.cartTotal

      if (flag) {
        await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity': newquantity, cartTotal: total } })
        return res.json({
          successStatus: true,
          count,
          totalamount: firstvalue + total,
          total,
          offer
        })
      } else {
        return res.json({
          successStatus: false
        })
      }
    } catch (err) {
      console.log(err)
      return res.json({
        successStatus: false
      })
    }
  },
  addtoWishlist: async (req, res) => {
    const productId = req.body.id
    const user = await User.findById(req.session.user._id)

    const pro = await User.find({ _id: user._id, 'wishlist.productId': productId })

    try {
      if (pro.length > 0) {
        return res.json({
          successStatus: true
        })
      } else {
        const wishitem = {
          productId
        }
        await User.findOneAndUpdate({ id: req.session.user._id }, { $push: { wishlist: wishitem } })
        return res.json({
          successStatus: true
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  removeWishItem: async (req, res) => {
    try {
      const user = req.session.user
      const productId = req.body.id

      await User.findOneAndUpdate({ _id: user._id }, { $pull: { wishlist: { productId } } })
      return res.json({ successStatus: true })
    } catch (err) {
      console.log(err)
    }
  },
  addtoCartfromWish: async (req, res) => {
    const user = await User.findOne({ _id: req.session.user._id })
    const productId = req.body.id
    const pro = await User.find({ _id: user._id, 'cart.productId': productId })
    const product = await Products.findById({ _id: productId })

    let amount
    if (product.offer > 0) {
      amount = (Math.round(product.price - (product.price * product.offer / 100)))
    } else {
      amount = product.price
    }
    console.log(amount)
    try {
      if (pro.length > 0) {
        await User.findOneAndUpdate({ _id: user._id, 'cart.productId': productId }, { $inc: { 'cart.$.quantity': +1, cartTotal: amount } })
        await User.findOneAndUpdate({ _id: req.session.user._id }, { $pull: { wishlist: { productId } } })
        res.json({
          successStatus: true,
          message: 'Item added to cart successfully'
        })
      } else {
        const user = await User.findById(req.session.user._id)
        console.log(user)
        const product = await Products.findById(productId)
        console.log(product)

        let total
        if (product.offer > 0) {
          total = Math.round(product.price - (product.price * product.offer / 100))
        } else {
          total = product.price
        }
        const cartItem = {
          productId,
          quantity: 1
        }

        const users = await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { cart: cartItem } })
        console.log(users)
        await User.findOneAndUpdate({ _id: req.session.user._id }, { $inc: { cartTotal: total } })
        await User.findOneAndUpdate({ _id: req.session.user._id }, { $pull: { wishlist: { productId } } })
        res.json({
          successStatus: true,
          message: 'Item added to cart successfully'
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
}
