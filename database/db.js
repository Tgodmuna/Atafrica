const {MongoClient} = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function connectToMongo(){
    const client = new MongoClient(uri,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    });
    try{
        await client.connect();
        console.log('Connected to MongoDB');
        return Client;
    }
    catch(err){
        console.error('Error connecting to MongoDB',err);
        throw err;
    }
}
module.exports = {connectToMongo}