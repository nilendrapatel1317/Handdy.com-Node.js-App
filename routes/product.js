var mongoose =require('mongoose');

const productSchema =mongoose.Schema({
  name:String,
  price:String,
  photo:String,
  userid: {type: mongoose.Schema.Types.ObjectId , ref:'user'},
})


module.exports = mongoose.model("product", productSchema)