const express = require ('express')
const router = express.Router()
const userControls=require('../controller/user-controller')
const session = require('../middleware/usersession')
const cartControls = require('../controller/cart-controller')
const paymentControls =  require('../controller/payment-controller')
const adminController = require('../controller/admin-controller')
const { isLogged, notLogged } = require('../middleware/usersession')



router.get('/login',session.notLogged,  userControls.getLogin)

router.get('/otp',session.notLogged,userControls.getOtp)
router.get('/register',session.notLogged,userControls.getRegister)
router.get('/',session.notLogged, userControls.getLandingpage)
router.get('/home' ,session.isLogged, userControls.getHomepage)
router.get('/productdetails',session.isLogged, userControls.getProductdetails)
router.get('/product/details/:id',session.isLogged, userControls.getDetailspage)
router.get('/cart',session.isLogged,cartControls.getCart)
router.get('/register/resend',userControls.resendOtp)

router.get('/logout',userControls.getUserlogout)
router.get('/adddetails',session.isLogged, userControls.getadddetails)
router.get('/checkout',session.isLogged,cartControls.getCheckout)
router.get('/payment/cod',session.isLogged,paymentControls.getOrdersucces)
router.get('/orders',session.isLogged,userControls.getOrder)
router.get('/address/edit',session.isLogged,userControls.getAddressadd)
router.get('/wishlist',session.isLogged,cartControls.getWishlist)
router.get('/paymentfail',session.isLogged,paymentControls.getPaymentfail)
router.get('/forgot-password',session.isLogged ,userControls.getForgetPassword)
router.get('/otpforgot',session.isLogged,userControls.getOtpforgot)
router.get('/edit-password',session.isLogged, userControls.getEditPassword)
router.get('/otpedit',session.isLogged,userControls.getOtpEdit)
router.get('/user/order-product',session.isLogged,userControls.getViewOrderDetails)
router.get('/shop',userControls.getShop)
router.get('/search',userControls.Search)

router.post('/register',session.isLogged, userControls.saveUser)
router.post('/otp',session.isLogged, userControls.addUser)
router.post('/login', userControls.redirectHomepage)
router.post('/edituser/:id',session.isLogged, userControls.editUser)
router.post('/payment/cod/:discount',session.isLogged, paymentControls.placeorderCod)
router.post('/add/address',session.isLogged, userControls.addAddress)
router.post('/payment/razorpay', paymentControls.placeorderRazorpay)
router.post('/create-paypalorder',session.isLogged,paymentControls.paypalPayment)
router.post('/checkout/addcoupon',session.isLogged, userControls.addCoupon)
router.post('/forgot-password',session.isLogged, userControls.forgotPassword)
router.post('/otp-forgot',session.isLogged, userControls.checkForgot)
router.post('/edit-password',session.isLogged, userControls.editPassword)
router.post('/otp-edituser', session.isLogged,userControls.editUserwithOtp)
router.post('/orders/product/details',session.isLogged,userControls.viewOrderDetails)


router.post('/payment/verify',session.isLogged,userControls.paymentVerify)
router.post('/payment/cancel',session.isLogged,userControls.paymentCancel)
router.post('/payment/fail',session.isLogged,userControls.paymentFail)

router.patch('/cart/add',session.isLogged, cartControls.addtoCart)
router.patch('/cart/remove',session.isLogged, cartControls.removeCartItem)
router.patch('/cart/change',session.isLogged, cartControls.changeQuantity)
router.patch('/orders/cancel',session.isLogged, userControls.orderCancel)
router.patch('/wishlist/add',session.isLogged, cartControls.addtoWishlist)
router.patch('/wish/remove',session.isLogged, cartControls.removeWishItem)
router.patch('/wishlist/cart/add',session.isLogged, cartControls.addtoCartfromWish)
router.patch('/delete/address',session.isLogged, userControls.deleteAddress)





module.exports=router