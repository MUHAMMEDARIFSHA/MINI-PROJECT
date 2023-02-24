
const express = require('express')

const router = express.Router()
const adminControls = require('../controller/admin-controller')
const session = require('../middleware/adminsession')
const { upload } = require('../db/multer')

router.get('/', session.notLogged, adminControls.getAdminlogin)

router.get('/adminlogin', session.isLogged, adminControls.getAdminhome)

router.get('/categories', session.isLogged, adminControls.getCategories)

router.get('/users', session.isLogged, adminControls.getUsers)

router.put('/userdata/:id', adminControls.blockUser)

router.patch('/categories/:id', session.isLogged, adminControls.deleteCategory)
router.patch('/coupons/:id', session.isLogged, adminControls.deleteCoupon)

router.patch('/orders/cancel', session.isLogged, adminControls.cancelOrder)

router.patch('/product/product-details/:id', session.isLogged, adminControls.deleteProduct)

router.patch('/orders/change', session.isLogged, adminControls.changeStatus)

router.post('/products/editproducts/:id', session.isLogged, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]), adminControls.editProduct)

router.get('/products', session.isLogged, adminControls.getProducts)

router.get('/products/addproducts', session.isLogged, adminControls.getAddproducts)

router.get('/products/editproducts/:id', session.isLogged, adminControls.getEditproducts)

router.get('/orders', session.isLogged, adminControls.getOrders)

router.get('/logout', adminControls.getAdminlogout)

router.get('/dashhome', session.isLogged, adminControls.getAdminhome)

router.get('/coupon', session.isLogged, adminControls.getCoupon)

router.get('/order-details', session.isLogged, adminControls.getOrderDetails)

router.get('/sale-details', adminControls.getSalesDetails)

router.get('/sales-report/pdf', adminControls.salesReportPdf)

router.post('/adminlogin', adminControls.redirectAdminhome)

router.post('/categories/add', session.isLogged, adminControls.addCategory)

router.post('/coupon/add', session.isLogged, adminControls.addCoupon)

router.post('/products/addproducts', session.isLogged, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }]), adminControls.addProducts)

module.exports = router
