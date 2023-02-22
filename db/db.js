const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const mongoDB = process.env.URL ;

 mongoose.connect(mongoDB, (err) => {
        if (err) {
            console.log(`Unable to connect to the server :${err}`);
    
        }
        else {
            console.log("MongoDB is connected")
        }
    })
    module.exports = mongoose.connection