const express = require ('express')
const router = express.Router()
const userControls=require('../controller/user-controller')
const session = require('../middleware/usersession')
const cartControls = require('../controller/cart-controller')



router.get('/login',session.notLogged,  userControls.getLogin)

router.get('/otp',session.notLogged,userControls.getOtp)
router.get('/register',session.notLogged,userControls.getRegister)
router.get('/',session.notLogged, userControls.getLandingpage)
router.get('/home',session.isLogged, userControls.getHomepage)
router.get('/productdetails',session.isLogged, userControls.getProductdetails)
router.get('/product/details/:id',session.isLogged, userControls.getDetailspage)
router.get('/cart',session.isLogged, userControls.getCart)
router.get('/register/resend',userControls.resendOtp)

router.get('/logout',userControls.getUserlogout)
router.get('/adddetails',session.isLogged, userControls.getadddetails)
router.get('/checkout',session.isLogged,userControls.getCheckout)
router.get('/payment/cod',session.isLogged,userControls.getOrdersucces)
router.get('/orders',session.isLogged,userControls.getOrder)
router.get('/address/edit',session.isLogged,userControls.getAddressadd)
router.get('/wishlist',session.isLogged,userControls.getWishlist)


router.post('/register',userControls.saveUser)
router.post('/otp',userControls.addUser)
router.post('/login',userControls.redirectHomepage)
router.post('/edituser/:id',userControls.editUser)
router.post('/payment/cod',userControls.placeorderCod)
router.post('/add/address/:id',userControls.addAddress)

router.patch('/cart/add',userControls.addtoCart)
router.patch('/cart/remove',userControls.removeCartItem)
router.patch('/cart/change',userControls.changeQuantity)
router.patch('/orders/cancel',userControls.orderCancel)
router.patch('/wishlist/add',userControls.addtoWishlist)




module.exports=router