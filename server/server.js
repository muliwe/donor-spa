const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const setup = require('./setup');
const socket = require('./socket')(io, http, Donor);

// run socket event listener
io.on('connection', socket);

// run server
http.listen(setup.PORT, () => {
    console.log('listening on *:' + setup.PORT);
});
