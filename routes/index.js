var express = require('express');
const passport = require('passport');
var router = express.Router();

var userModel = require('./users')
var productModel = require('./product')

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

// For Home 
router.get('/', function(req, res, next) {
  res.render('index');
});

// For Signup
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

// Registering code
router.post('/register', function(req,res,next){
  var data = new userModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email,
  })
  userModel.register(data , req.body.password)
    .then(function(user){
      passport.authenticate('local')(req,res , function(){
        res.redirect('/userprofile')
      })
    })
})

// For Login
router.get('/login', function(req, res, next) {
  res.render('login');
});

// Login code
router.post('/login', passport.authenticate('local',{
  successRedirect:'/',
  failureRedirect:'/'
}), function(req,res,next){})


// Logout code
router.get('/logout', function(req,res,next){
  req.logOut(function(err){
    if (err) {return next(err);}
    res.redirect('/')
  });
});



// For Profile
router.get('/userprofile',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    res.render("userprofile", {loggedinuser})
  })
});

// isLoggedIn
function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/loginfirst')
  }
}

router.get('/loginfirst', function(req,res){
  res.render("loginfirst")
})

// For View All users data
router.get('/allusers', function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    userModel.find().then(function(allusersdata){
      res.render("allusers",{allusersdata,loggedinuser})
    })
  })
})

// For Making Frienda
router.get('/friends/:id', function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    userModel.findOne({_id:req.params.id})
    .then(function(jisko_f_bnana_he){

      if(jisko_f_bnana_he.friends.indexOf(loggedinuser._id)=== -1){
        loggedinuser.friends.push(jisko_f_bnana_he._id)
        jisko_f_bnana_he.friends.push(loggedinuser._id)
      }
      else{
        loggedinuser.friends.splice(jisko_f_bnana_he._id,1)
        jisko_f_bnana_he.friends.splice(loggedinuser._id,1)
      }

      
      loggedinuser.save()
      .then(function(){
        jisko_f_bnana_he.save()
        .then(function(){
          res.redirect("back")
        })
      })
    })
  })
})

// For Edit User Profile
router.get('/editprofile',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    userModel.findOne({username:req.session.passport.user})
    .then(function(loggedinuser){
      res.render("editprofile", {loggedinuser, loggedinuser})
  })
  })
});
router.post('/updateinfo',isLoggedIn, function(req, res, next) {
  userModel.findOneAndUpdate({username:req.session.passport.user},
    {
      name:req.body.name,
      username:req.body.username,
      age:req.body.age,
      profession:req.body.profession,
      email:req.body.email,
      photo:req.body.photo
    },{new:true}).then(function(loggedinuser){
      res.render('userprofile',{loggedinuser})
    })
  
  });

  
  

// for creating Product
router.post('/createproduct',isLoggedIn, function(req, res, next) {
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedinuser){
    productModel.create({
      name:req.body.name,
      price:req.body.price,
      photo:req.body.photo,
      userid:loggedinuser._id,
    }).then(function(product){
      loggedinuser.products.push(product._id);
      loggedinuser.save()
      .then(function(){
        res.redirect('/allproducts')
      })
    })
  })
});
router.get('/allproducts',isLoggedIn ,function(req, res, next) {
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedinuser){
    productModel.find()
      .populate("userid")
      .then(function(allproduct){
        res.render('products',{allproduct,loggedinuser})
      })
  })
});

// For Edit Product
router.get('/editproduct/:id',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    productModel.findOne({_id:req.params.id})
    .then(function(productItem){
      res.render("editproductinfo",{productItem,loggedinuser})
  })
  })
});
router.post('/updateproductinfo/:id',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    productModel.findOneAndUpdate({_id:req.params.id},{
      name:req.body.name,
      price:req.body.price,
      photo:req.body.photo,
    },{new:true}).then(function(productItem){
    res.redirect("/allproducts")
  })
  })
});

// For Delete Product
router.get('/deleteproduct/:id',isLoggedIn, function(req, res, next) {
  productModel.findOneAndDelete({_id:req.params.id})
  .then(function(){
    res.redirect('back')
  })
});


// For Cart 
router.get('/cart/:id',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    loggedinuser.carts.push(req.params.id);
    loggedinuser.save()
      .then(function(){
        res.redirect("back")
      })
  })
});
router.get('/remove/cart/:id',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    var index = loggedinuser.carts.indexOf(req.params.id)
    loggedinuser.carts.splice(index,1);
    loggedinuser.save()
      .then(function(){
        res.redirect("back")
      })
  })
});

// For view All Carts Added products
router.get('/cartsproduct',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .populate({
    path : 'carts',
    populate : {
      path : 'userid'
    }
  })
  .then(function(loggedinuser){
    res.render("cartaddedproducts", { loggedinuser})
  })
});









module.exports = router;
