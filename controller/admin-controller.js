/* eslint-disable no-undef */
/* eslint-disable eqeqeq */

const Adminregister = require('../models/admin')
const Category = require('../models/category')
const Products = require('../models/products')
const User = require('../models/user')
const Orders = require('../models/order')
const Coupons = require('../models/coupon')
const puppeteer = require('puppeteer')

module.exports = {
  getAdminlogin: (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      return res.render('admin/adminlogin', { message })
    } else {
      const message = ''
      return res.render('admin/adminlogin', { message })
    }
  },
  getAdminhome: (req, res) => {
    return res.render('admin/home-dashboard')
  },
  redirectAdminhome: async (req, res) => {
    const admin = await Adminregister.find({ adminname: req.body.adminname })
    if (admin.length != 0) {
      console.log(admin)
      if (admin[0].adminpassword != req.body.adminpassword) {
        console.log(req.body.adminpassword)
        req.session.message = 'password not correct'
        res.redirect('/admin')
      } else {
        req.session.admin = admin
        return res.redirect('/admin/adminlogin')
      }
    } else {
      req.session.message = 'Invalid Admin'
      res.redirect('/admin')
    }
  },
  getAdminlogout: (req, res) => {
    req.session.admin = null
    return res.redirect('/admin')
  },
  getCategories: async (req, res) => {
    try {
      const category = await Category.find({ isDeleted: false })
      if (req.session.message) {
        const message = req.session.message
        req.session.message = ''
        return res.render('admin/categories', { message, category })
      } else {
        const message = req.session.message = ''
        return res.render('admin/categories', { message, category })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getUsers: async (req, res) => {
    try {
      const register = await User.find()
      return res.render('admin/user/userdata', { register })
    } catch (err) {
      console.log(err)
    }
  },
  blockUser: async (req, res) => {
    console.log('hi')
    try {
      const id = req.params.id
      const user = await User.findById(id)
      console.log(user)

      if (user.isBlocked) {
        console.log('blocked')
        try {
          await User.findOneAndUpdate({ _id: id }, {
            $set: {
              isBlocked: false
            }
          })
          return res.json({
            successStatus: true,
            redirect: '/admin/users'
          })
        } catch (err) {
          console.log(err)
          return res.json({
            successStatus: false
          })
        }
      } else {
        console.log('not blocked')
        try {
          const find = await User.findOneAndUpdate({ _id: id }, {
            $set: {
              isBlocked: true
            }
          })
          console.log(find)
          console.log('done')
          return res.json({
            successStatus: true,
            redirect: '/admin/users'
          })
        } catch (err) {
          console.log(err)
          return res.json({
            successStatus: false
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await Products.find({ isDeleted: false }).populate('categoryId')
      return res.render('admin/product/product-details', { products })
    } catch (err) {
      console.log(err)
    }
  },
  getAddproducts: async (req, res) => {
    const category = await Category.find({ isDeleted: false })
    return res.render('admin/product/product-add', { category })
  },
  getEditproducts: async (req, res) => {
    const category = await Category.find()
    const products = await Products.findById(req.params.id)

    return res.render('admin/product/product-edit', { category, products })
  },
  getOrders: async (req, res) => {
    const orders = await Orders.find().sort({ createdAt: -1 })
      .populate('customerId')
      .populate('items.productId')
    console.log(orders)
    return res.render('admin/order', { orders })
  },

  addCategory: async (req, res) => {
    try {
      const categoryname = req.body.category.toUpperCase()
      const storecategory = new Category({
        categoryname: req.body.category.toUpperCase()
      })
      const category = await Category.find({ categoryname, isDeleted: false })
      if (category.length == 0) {
        try {
          await storecategory.save()
          return res.redirect('/admin/categories')
        } catch (error) {
          req.session.message = error.errors.categoryname.properties.message

          return res.redirect('/admin/categories')
        }
      } else {
        req.session.message = 'Category already exist'
        res.redirect('/admin/categories')
      }
    } catch (err) {
      console.log(err)
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const id = req.params.id
      await Category.findOneAndUpdate({ _id: id }, {
        $set: {
          isDeleted: true
        }
      })
      return res.json({
        successStatus: true,
        redirect: '/admin/categories'
      })
    } catch (err) {
      console.log(err)
    }
  },

  addProducts: async (req, res) => {
    try {
      const images = []
      for (key in req.files) {
        const paths = req.files[key][0].path
        images.push(paths.slice(7))
      }
      const storeproducts = new Products({
        productname: req.body.productname,
        color: req.body.colour,
        size: req.body.size,
        price: req.body.price,
        offer: req.body.offer,
        description: req.body.description,
        totalStoke: req.body.totalstoke,

        categoryId: req.body.categoryId,
        images
      })
      try {
        await storeproducts.save()
        return res.redirect('/admin/products')
      } catch (error) {
        console.log(error)
        return res.redirect('/admin/products/addproducts')
      }
    } catch (err) {
      console.log(err)
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const id = req.params.id
      await Products.findOneAndUpdate({ _id: id }, {
        $set: {
          isDeleted: true
        }
      })
      return res.json({
        successStatus: true,
        redirect: '/admin/products'
      })
    } catch (err) {
      console.log(err)
    }
  },
  editProduct: async (req, res) => {
    try {
      const id = req.params.id
      const product = await Products.findById(id)
      const images = product.images
      if (req.files.image) {
        const paths = req.files.image[0].path
        images.splice(0, 1, paths.slice(7))
      }
      if (req.files.image2) {
        const paths = req.files.image2[0].path
        images.splice(1, 1, paths.slice(7))
      }
      if (req.files.image3) {
        const paths = req.files.image3[0].path
        images.splice(2, 1, paths.slice(7))
      }

      // const images =[];
      //     for(key in req.files){
      //         const paths = req.files[key][0].path

      //         images.push(paths.slice(7))
      //     }
      console.log(id)
      console.log(req.body)
      await Products.findByIdAndUpdate({ _id: id }, req.body)
      await Products.findByIdAndUpdate({ _id: id }, {
        images
      })
      return res.redirect('/admin/products')
    } catch (err) {
      console.log(err)
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const id = req.body.id
      await Orders.findOneAndUpdate({ _id: id }, {
        $set: {
          cancelled: true
        }
      })
      return res.json({
        successStatus: true

      })
    } catch (err) {
      console.log(err)
    }
  },
  changeStatus: async (req, res) => {
    console.log('asdfghjk')
    const id = req.body.id
    console.log(id)
    const status = req.body.value
    console.log(status)
    await Orders.findOneAndUpdate({ _id: id },
      {
        $set: {
          orderStatus: status
        }
      })
    return res.json({
      successStatus: true

    })
  },
  getCoupon: async (req, res) => {
    if (req.session.message) {
      const message = req.session.message
      req.session.message = ''
      const coupons = await Coupons.find({ isDeleted: false })
      return res.render('admin/coupons', { message, coupons })
    } else {
      const message = ''
      const coupons = await Coupons.find({ isDeleted: false })
      return res.render('admin/coupons', { message, coupons })
    }
  },
  addCoupon: async (req, res) => {
    try {
      const exist = await Coupons.find({ coupon: req.body.coupon })
      if (exist.length > 0) {
        req.session.message = 'Coupon already exist'
        return res.redirect('/admin/coupon')
      }

      const expiry = new Date(req.body.expiry)
      const coupon = new Coupons({
        coupon: req.body.coupon,
        details: req.body.details,
        expiry,
        discount: req.body.discount

      })
      if (req.body.percentage) {
        coupon.isPercentage = true
      }
      await coupon.save()
      return res.redirect('/admin/coupon')
    } catch (err) {
      console.log(err)
    }
  },
  deleteCoupon: async (req, res) => {
    try {
      const id = req.params.id
      await Coupons.findOneAndUpdate({ _id: id }, {
        $set: {
          isDeleted: true
        }
      })
      return res.json({
        successStatus: true

      })
    } catch (err) {
      console.log(err)
    }
  },
  getOrderDetails: async (req, res) => {
    try {
      const orders = await Orders.aggregate([
        {
          $unwind: '$items'
        },
        {
          $match: {
            cancelled: false,
            paymentVerified: true
          }
        },
        {
          $group: {
            _id: { $dayOfYear: '$createdAt' },
            date: { $first: '$createdAt' },
            totalSpent: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: {
            date: 1
          }
        }

      ])
      res.json({ orders })
    } catch (err) {
      console.log(err)
    }
  },
  getSalesDetails: async (req, res) => {
    console.log('sale report page')
    try {
      const orders = await Orders.find({ $match: { cancelled: false, paymentVerified: true } }).sort({ createdAt: -1 })
        .populate('customerId')

      console.log('puppeteer orders')
      res.render('admin/sales-details', { orders })
    } catch (err) {
      console.log(err)
    }
  },

  salesReportPdf: async (req, res) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('http://localhost:4000/admin/sale-details', {
      waitUntil: 'networkidle2'
    })
    await page.pdf({ path: 'sales-details.pdf', format: 'a4', landscape: true })

    await browser.close()
    res.download('sales-details.pdf', 'Sale Report.pdf')
  }

}
