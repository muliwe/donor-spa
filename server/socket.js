const Donor = require('./models/donor');
const Location = require('./models/location');

/**
 * A Factory for Socket event listener
 * @param {Object} io Socket.io instance
 * @param {Object} http Express instance
 * @returns {Function} Socket.io event listener
 */
const socketFactory = (io, http) => {
    const hashes = [];
    const pins = {};
    const locations = {};
    const connected = {};

    return socket => {
        console.log(`user ${socket.id} connected`);
        connected[socket.id] = true;

        http.getConnections((err, count) => {
            if (!err) {
                console.log(`Server: ${io.engine.clientsCount}.${count}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`user ${socket.id} disconnected`);
            delete connected[socket.id];
        });

        socket.on('hash', msg => {
            if (hashes.includes(msg)) {
                console.log('user emitted existing hash ' + msg);

                if (pins.hasOwnProperty(msg)) {
                    socket.emit('pin-data', pins[msg]);
                }
            } else {
                console.log('user emitted new hash '+ msg);
                hashes.push(msg);
                pins[msg] = new Donor({hash: msg});
            }
        });

        socket.on('location', msg => {
            let msgData = {};

            try {
                msgData = JSON.parse(msg);
            } catch (error) {
                console.error(error);
            }

            if (locations.hasOwnProperty(socket.id)) {
                locations[socket.id].update(msgData);
            } else {
                locations[socket.id] = new Location(msgData);
            }

            socket.emit('pin-map-update', locations[socket.id].filter(pins));
        });

        socket.on('pin-data-upsert', msg => {
            let msgData = {};

            try {
                msgData = JSON.parse(msg);
            } catch (error) {
                console.error(error);
            }

            if (hashes.includes(msgData.hash)) {
                console.log('user emitted existing hash pin upsert ' + msgData.hash);

                if (pins.hasOwnProperty(msgData.hash)) {
                    pins[msgData.hash].update(msgData);
                } else {
                    console.log(`Inconsistent hash ${msgData.hash}`);
                }
            } else {
                console.log('user emitted not existing hash pin upsert ' + msgData.hash);
                hashes.push(msgData.hash);
                pins[msgData.hash] = new Donor(msgData);
            }

            socket.emit('pin-data', JSON.stringify(pins[msgData.hash]));
        });

        socket.on('emit', msg => {
            console.log('user emitted: ' + msg);
        });
    };
};

module.export = socketFactory;
