const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const setup = require('./setup');
const socket = require('./socket')(io, http);

// run socket event listener
io.on('connection', socket);

app.use('/static', express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// run server
http.listen(setup.PORT, () => {
    console.log('listening on *:' + setup.PORT);
});
