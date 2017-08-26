const expect = require('chai').expect;
const io = require('socket.io-client');

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

    it('should receive hash on undefined', function(done){
        const client = {
            on: {
                'pin-data': helpers.definedProperty('hash')
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

    it('should no receive pin for wrong location', function(done){
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
});
