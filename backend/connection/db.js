const mongoose = require('mongoose');
const connect = async () => {
    try {
        await mongoose.connect(process.env.MongoDbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    }
    catch(err) {
        console.log(err.message);
        process.exit(1);
    }
}
module.exports=connect;