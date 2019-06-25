let mongoose = require('mongoose');
const server = '127.0.0.1:27017';
const database = 'vmdb';

mongoose.connect('mongodb+srv://vmUser:vmPassword%21@venturemine-b5fdf.mongodb.net/vmdb?retryWrites=true&w=majority')
    .then(() => {
        console.log('Database connection successful');
    })
    .catch(err => {
        console.error('Database connection error')
    });