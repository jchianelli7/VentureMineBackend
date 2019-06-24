const mongoClient = require('mongodb').MongoClient;
const mongoDbUrl = 'mongodb+srv://vmUser:vmPassword%21@venturemine-b5fdf.mongodb.net/test?retryWrites=true&w=majority';
let mongodb;

function connect(callback){
    mongoClient.connect(mongoDbUrl, (err, db) => {
        mongodb = db;
        callback();
    });
}
function get(){
    return mongodb;
}

function close(){
    mongodb.close();
}

module.exports = {
    connect,
    get,
    close
};