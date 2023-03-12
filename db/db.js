const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const mongoDB = process.env.URL ;

const options = {
    connectTimeoutMS: 30000, // 30 seconds timeout
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  mongoose.connect(mongoDB, options)
  .then(() => {
    console.log('Connected successfully to MongoDB server');

    // Use Mongoose to perform database operations
    const db = mongoose.connection.db;

    // ...
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

  module.exports = mongoose.connection

//  mongoose.connect(mongoDB, (err) => {
//         if (err) {
//             console.log(`Unable to connect to the server :${err}`);
//          }
//         else {
//             console.log("MongoDB is connected")
//         }
//     })
//     module.exports = mongoose.connection