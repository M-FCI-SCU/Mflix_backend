const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@cluster0.ag5hi.mongodb.net/sample_mflix?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

// Database Name
let _db = null
module.exports.get_MFLIX_DB = () => {
    return _db
}
module.exports.StartMongodb = async () => {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db();
    _db = db
}
