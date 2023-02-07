const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const mongoDB = "mongodb://127.0.0.1:27017/ecommerce";

 mongoose.connect(mongoDB, (err) => {
        if (err) {
            console.log(`Unable to connect to the server :${err}`);
    
        }
        else {
            console.log("MongoDB is connected")
        }
    })
    module.exports = mongoose.connection