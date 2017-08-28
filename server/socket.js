const Donor = require('./models/donor');
const Location = require('./models/location');

const VERBOSE = false;

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
        VERBOSE && console.log(`user ${socket.id} connected`);
        connected[socket.id] = true;

        let emit = (eventName, eventData) => {
            VERBOSE && console.log(`Server emitted ${eventName} to client ${socket.id}`);
            socket.emit(eventName, JSON.stringify(eventData));
        };

        http.getConnections((err, count) => {
            if (!err) {
                VERBOSE && console.log(`Server connections: ${io.engine.clientsCount}(${count})`);
            }
        });

        socket.on('disconnect', () => {
            VERBOSE && console.log(`user ${socket.id} disconnected`);
            delete connected[socket.id];
            delete locations[socket.id];
        });

        /**
         * Sets client hash
         */
        socket.on('hash', msg => {
            const hash = '' + (msg || socket.id + Math.random().toString().substr(2));

            if (hashes.includes(hash)) {
                VERBOSE && console.log('user emitted existing hash ' + hash);

                if (pins.hasOwnProperty(hash)) {
                    emit('pin-data', pins[hash]);
                } else {
                    VERBOSE && console.log(`Inconsistent hash ${hash}`);
                }
            } else {
                VERBOSE && console.log('user emitted new hash '+ hash);
                hashes.push(hash);
                pins[hash] = new Donor({hash: hash}, socket.handshake.address.address);
                emit('pin-data', pins[hash]);
            }
        });

        /**
         * Sets client location
         */
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

            VERBOSE && console.log(`User emitted location: ${msg}`);

            const updatedPins = locations[socket.id].filter(pins);

            if (updatedPins.length) {
                emit('pin-map-update', updatedPins);
            }
        });

        /**
         * Upserts client pin
         */
        socket.on('pin-data-upsert', msg => {
            let msgData = {};

            try {
                msgData = JSON.parse(msg);
                msgData.hash = '' + msgData.hash;
            } catch (error) {
                console.error(error);
            }

            if (hashes.includes(msgData.hash)) {
                VERBOSE && console.log('user emitted existing hash pin upsert ' + msgData.hash);

                if (pins.hasOwnProperty(msgData.hash)) {
                    let err = pins[msgData.hash].update(msgData, socket.handshake.address.address);
                    if (err) {
                        emit('pin-data-error', {error: err});
                        return;
                    }
                } else {
                    VERBOSE && console.log(`Inconsistent hash ${msgData.hash}`);
                }
            } else {
                VERBOSE && console.log('user emitted not existing hash pin upsert ' + msgData.hash);
                hashes.push(msgData.hash);
                pins[msgData.hash] = new Donor(msgData, socket.handshake.address.address);
            }

            // push to author
            emit('pin-data', pins[msgData.hash]);

            // notify near locations
            Location.findAround(pins[msgData.hash], locations).forEach(socketId => {
                const updatedPins = locations[socketId].filter({[msgData.hash]: pins[msgData.hash]},
                    true); // ignore shown

                if (io.sockets.connected[socketId] && updatedPins.length) {
                    VERBOSE && console.log(`User ${socketId} location notified for updating pins`);
                    io.sockets.connected[socketId].emit('pin-map-update', JSON.stringify(updatedPins));
                }
            });
        });

        /**
         * Full pin data getter
         */
        socket.on('get-pin', msg => {
            const hash = '' + msg;

            if (pins.hasOwnProperty(hash)) {
                emit('pin-info', pins[hash]);
            }
        });
    };
};

module.exports = socketFactory;
