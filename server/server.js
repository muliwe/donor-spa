const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const setup = require('./setup');
const socket = require('./socket')(io, http);

// run socket event listener
io.on('connection', socket);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/', express.static(path.join(__dirname, '../client')));

// run server
http.listen(setup.PORT, () => {
    console.log('listening on *:' + setup.PORT);
});
