const mongoose = require('mongoose')

bannerSchema = new mongoose.Schema({

   bannername:{
    type:String,
    required:true
    },

    image :{
        type :[String],
        require:true
    },
     isDeleted:{
        type :Boolean,
        default:false
    },
    present:{
    type :Boolean,
    default :true
    }


})
const Banner = mongoose.model('Banner',bannerSchema);
module.exports = Banner