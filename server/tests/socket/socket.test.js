const expect = require('chai').expect;
const io = require('socket.io-client');
const assert = require('assert');

const app = require('../../../server/server');
const setup = require('../../../server/setup');

const socketUrl = 'http://localhost:' + setup.PORT;

const options = {
    transports: ['websocket'],
    'force new connection': true
};

const SocketTester = require('socket-tester');
const socketTester = new SocketTester(io, socketUrl, options);

const helpers = require('../helpers');
const testData = require('../mocks/test-data');

describe('Sockets', function() {
    const HASH = 12345;
    const emptyData = Object.assign({}, testData.emptyPin);
    emptyData.hash = '' + HASH;
    const deletedData = Object.assign({}, testData.filledPin);
    deletedData.hash = '' + HASH;
    const data = Object.assign({}, testData.filledPin);
    data.hash = '22' + HASH;
    data.deleted = false;
    const HASH2 = 22222;
    const location = Object.assign({}, testData.location);
    const location2 = Object.assign({}, testData.location2);

    it('should receive same hash in response data', function(done){
        const client = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify(emptyData))
            },
            emit: {
                'hash': HASH
            }
        };

        socketTester.run([client], done);
    });

    it('should receive proper hash on undefined', function(done){
        const client = {
            on: {
                'pin-data': helpers.definedProperty('hash', 36)
            },
            emit: {
                'hash': undefined
            }
        };

        socketTester.run([client], done);
    });

    it('should not receive unknown pin', function(done){
        const client = {
            on: {
                'pin-info': socketTester.shouldNotBeCalled()
            },
            emit: {
                'get-pin': HASH2
            }
        };

        socketTester.run([client], done);
    });

    it('should receive updated pin data', function(done){
        const client1 = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify(deletedData))
            },
            emit: {
                'pin-data-upsert': JSON.stringify(deletedData)
            }
        };

        const client2 = {
            on: {
                'pin-info': socketTester.shouldBeCalledWith((JSON.stringify(deletedData)))
            },
            emit: {
                'get-pin': HASH
            }
        };

        socketTester.run([client1, client2], done);
    });

    it('should receive empty pin array after location is set', function(done){
        const client = {
            on: {
                'pin-map-update': helpers.hasLength(0)
            },
            emit: {
                'location': JSON.stringify(location)
            }
        };
        socketTester.run([client], done);
    });

    it('should receive only 1 proper pin or 3 after location and pin are set', function(done){
        const client1 = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify(data))
            },
            emit: {
                'pin-data-upsert': JSON.stringify(data)
            }
        };

        const client2 = {
            on: {
                'pin-map-update': helpers.hasLength(1)
            },
            emit: {
                'location': JSON.stringify(location)
            }
        };
        socketTester.run([client1, client2], done);
    });

    it('should not receive pin for wrong location', function(done){
        const client1 = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify(data))
            },
            emit: {
                'pin-data-upsert': JSON.stringify(data)
            }
        };

        const client2 = {
            on: {
                'pin-map-update': helpers.hasLength(0)
            },
            emit: {
                'location': JSON.stringify(location2)
            }
        };
        socketTester.run([client1, client2], done);
    });

    it('should receive extra pin update due to location on pin upsert', function(done){
        const client1 = {
            emit: {
                'pin-data-upsert': JSON.stringify(data)
            }
        };

        const client2 = {
            on: {
                'pin-map-update': helpers.hasLength(1)
            },
            emit: {
                'location': JSON.stringify(location)
            }
        };
        socketTester.run([client2, client1], done);
    });

    it('should receive extra pin updates due to location change', function(done){
        const client1 = io.connect(socketUrl, options);
        let client2;
        const messages = [];
        const toUpdate = Object.assign({}, data, {bloodGroup: 'B+'});

        client1.on('connect', function() {
            client1.emit('location', JSON.stringify(location));

            client2 = io.connect(socketUrl, options);
            client2.on('connect', function() {
                client1.emit('location', JSON.stringify(location2));
            });
        });

        client1.on('pin-map-update', function(msg) {
            messages.push(msg);
        });

        setTimeout(function(){
            client1.disconnect();
            client2.disconnect();

            assert.equal(JSON.parse(messages[0])[0].bloodGroup, 'A+');
            assert(!JSON.parse(messages[0])[0].hide);
            assert(!JSON.parse(messages[1])[0].bloodGroup);
            assert(JSON.parse(messages[1])[0].hide);

            done();
        }, 30);
    });
});
