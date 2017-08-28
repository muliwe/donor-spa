const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socket = require('./socket')(io, http);
const mongoose = require('mongoose');
const path = require('path');

const db = require('./dbconfig');
const setup = require('./setup');

// run socket event listener
io.on('connection', socket);

// connect to mongo
mongoose.connect(db.url);

// default url
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// show static from root
app.use('/', express.static(path.join(__dirname, '../client')));

// run server
http.listen(setup.PORT, () => {
    console.log('listening on *:' + setup.PORT);
});
