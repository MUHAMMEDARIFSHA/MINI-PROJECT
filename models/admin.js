const mongoose =require('mongoose')

const AdminSchema =new mongoose.Schema({
    adminname:{
        type:String,
        require:true
    },
    adminpassword:{
        type:String,
    require:true    
},
})
const Adminregister = mongoose.model('Adminregister',AdminSchema)
module.exports=Adminregister;


