var express = require('express');
var dbconnect = require('../../dbFunctions/dbConnections')
var db = require('../../dbFunctions/dbUserConnection')
var router = express.Router();
/* vrify user is logedin function. */
const verifyLogin = (req, res, next) => {
    let user = req.session.logedIn
    if (user) {
        next()
    }
    else {
        res.redirect('/login')
    }
}    


/* GET home page.*/
router.get('/',async function(req, res, next) {
    const search=req.query.search
  
    let user =req.session.user
    let count=0
    if(user){
        count=await db.cartCount(user._id)
    }
      if(search){
       db.searchData(search).then(async(product) => {
        let ads=await dbconnect.getAdverticement()

        res.render('user/userHome', { product: product,count:count, user: user, admin: false ,ads:ads});
    })
    }else{
            dbconnect.getProduct().then(async(product) => {
        let ads=await dbconnect.getAdverticement()

        res.render('user/userHome', { product: product,count:count, user: user, admin: false ,ads:ads});
    })
    }

});
/* GET LOGIN  page. */
router.get('/login', function (req, res, next) {
    if (req.session.logedIn) {
        res.redirect('/')
    }
    else {
        let err = req.session.err
        res.render('user/userLogin', { message: err })
        req.session.err = ''
    }

});
/* GET update login page. */
router.post('/login', function (req, res, next) {
    db.readUserData(req.body).then((response) => {
        req.session.logedIn = true
        req.session.user = response
        res.redirect('/')
    }).catch((error) => {
        req.session.err = error
        res.redirect('/login')
    })
});
/* GET SIGNUP page. */
router.get('/signup', function (req, res, next) {
    res.render('user/userSignup', { message: false });
});

/* GET UPDATE SIGNUP page. */
router.post('/signup', function (req, res, next) {
    db.AddUserData(req.body).then((response) => {
        res.redirect('/')
    }).catch((errors) => {
        res.render('user/userSignup', { message: true, error: errors });
    })

});
/* GET LOGOUT . */
router.get('/logout', function (req, res, next) {
    req.session.destroy()
    res.redirect("/")
})

/* aadd to cart . */
router.get('/addToCart/:id', function (req, res, next) {
    const userId = req.session.user
    if(userId){
        
        db.addToCart(userId._id, req.params.id).then(() => {
        res.json({ status: true })
    }).catch(() => {
        res.json({ status: false })
    })
    }
    else{console.log('enter the user page')
        res.json({ status: false })
    }
   
})

/* view cart . */
router.get('/viewcart', verifyLogin, function (req, res, next) {
    userId = req.session.user._id
    db.viewCart(userId).then((response) =>{
        db.totalPrice(userId).then((total)=>{
             let totalvalue=total[0].total
        res.render('user/userCart', { cartItems:response,user:userId,total:totalvalue}) 
        })
       
    }).catch(() => {
       res.render('error',{message:'you have no cart'})
    })
})

/* changeQuantity and total . */
router.post('/changeQuantity', function(req, res, next){
    console.log('the user id for count is ',req.body)
  db.changeQuantity(req.body).then((response)=>{
    const userId=req.body.userId
    db.totalPrice(userId).then((total)=>{
        response.total=total[0].total 
        res.json(response)
    })
    
  })

})

/* order details . */
router.get('/placeOrder/:id',verifyLogin,function(req,res,next){
    const userId=req.params.id
    console.log('user id:',userId)
    db.totalPrice(userId).then((total)=>{
        total=total[0].total 
        res.render('user/orderPlace',{total,userId})
    })
    
})

/* checkout. */
router.post('/placeOrder',async function(req,res,next){
    console.log('orrder details',req.body)
    const product=await db.useProduct(userId)
    db.placeOrder(req.body,product).then((response)=>{
        if(req.body['payment-method']='COD')
        {
            
            res.json('your order successfully')
        }
        else{
            db.razorpayConnect(response)
        }
       
    })
}) 
/* Profile . */ 
router.get('/profile',verifyLogin,function(req,res,next){
   const user= req.session.user
   
    res.render('user/profile',{user})
})
router.get('/productDetail/:id', function(req,res){
    db.productDetail(req.params.id).then(async(product)=>{
       const user= req.session.user
        if(user){
           var quantity=await db.productQuantity(user._id,req.params.id)
           
        }
        res.render('user/productDetail',{product,user,quantity})
    })
})
module.exports = router; 