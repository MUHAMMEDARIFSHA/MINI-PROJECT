
const mongoose = require('mongoose')
const { ModelBuildInstance } = require('twilio/lib/rest/autopilot/v1/assistant/modelBuild')

const categorySchema = new mongoose.Schema({

    categoryname:{
        type:String,
        required :[ true ,'Category cannot be empty']
    },
    isDeleted:{
        type : Boolean,
        default : false
    },
    
})
const Category = mongoose.model('Category',categorySchema)
    module.exports = Category
