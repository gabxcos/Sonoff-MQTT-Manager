const logger = require('./logger');

const mongoose = require('mongoose');
const { DB_HOST, DB_NAME } = require('./config');


//mongoose.set('useCreateIndex', true);
mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
    });
const db = mongoose.connection;
db.on('error', ()=>logger('MongoDB', 'Couldn\'t connect to a running database.'));
db.once('open', ()=>logger('MongoDB', 'Connection established with the database.'));

module.exports = { db };