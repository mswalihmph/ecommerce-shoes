var express = require('express');
var router = express.Router();
var dbconnect = require('../../dbFunctions/dbConnections')
const fs=require('fs')

const verifyLogin = (req, res, next) => {
  let user = req.session.adminlogedIn
  if (user) {
      next()
  }
  else {
      res.redirect('/admin/login')
  }
}
/* GET home page. */
router.get('/', verifyLogin,function (req, res, next) {
   const admin =req.session.admin
  dbconnect.getProduct().then((product) => {
    res.render('admin/adminProduct', { product: product, admin: true ,name:admin.name});
  })
});


router.get('/addProduct',verifyLogin, function (req, res, next) {
  const admin =req.session.admin
  res.render('admin/addProduct',{admin: true,name:admin.name});
});


router.post('/addProduct',function (req, res, next) {
  const image = req.files.files
  dbconnect.addProduct(req.body, (snapshot) => {
    const id = snapshot.toString()
    image.mv('./public/images/productImages/' + id + '.jpg', (error, done) => {
      if (!error) {
        res.redirect('/admin');
      }

    })

  })
});
router.get('/changeProduct/:id',verifyLogin, function (req, res, next) {
  const admin =req.session.admin
  const id=req.params.id
  dbconnect.changeProduct(id).then((product)=>{
    console.log(product)
    res.render('admin/editProduct',{admin:true,product:product,name:admin.name});
  })
  
});
router.post('/changeProduct',function (req,res){
  console.log(req.body)
  const id=req.body.id
  const image = req.files.files
dbconnect.addChanges(req.body).then((response)=>{
  image.mv('./public/images/productImages/' + id + '.jpg', (error, done) => {
    if (!error) {
     res.redirect('/admin')
    }
  })
  
})
})

router.get('/deleteProduct/:id', function (req, res, next) {
  const prodId=req.params.id 
  dbconnect.deleteProduct(prodId).then((response)=>{
      const imagePath='./public/images/productImages/' + prodId + '.jpg'
      fs.unlink(imagePath,(err)=>{
        if(err){
          console.log('err')
        }
         else{
        console.log('remove images')
      } 
      })
     
      res.redirect('/admin')
  })
 
});

router.get('/login', function (req, res, next) {
  if (req.session.logedIn) {
      res.redirect('/admin')
  }
  else {
      let err = req.session.err
      res.render('admin/adminLogin', { message: err })
      req.session.err = ''
  }

});

/* GET update login page. */
router.post('/login', function (req, res, next) {
    dbconnect.readAdminData(req.body).then((response) => {
        req.session.adminlogedIn = true
        req.session.admin = response
        res.redirect('/admin')
    }).catch((error) => {
        req.session.err = error
        res.redirect('/admin/login')
    })
});
router.get('/logout', function (req, res, next) {
  req.session.destroy()
  res.redirect("/admin")
})
router.get('/Adverticement',function (req,res,next){
  dbconnect.getAdverticement().then((response)=>{
    res.render('admin/Adverticement',{product:response})
  })
})
router.get('/addAdverticement',(req,res)=>{
  res.render('admin/addAdverticement')
})
router.post('/addAdverticement',(req,res)=>{
  const image = req.files.files
  dbconnect.addAdverticement(req.body, (snapshot) => {
    const id = snapshot.toString()
    image.mv('./public/images/adverticemente/' + id + '.jpg', (error, done) => {
      if (!error) {
        res.redirect('/admin');
      }

    })

  })
})
module.exports = router; 