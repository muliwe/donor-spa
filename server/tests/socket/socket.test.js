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

const testData = require('../mocks/test-data');

describe('Sockets', function() {
    const HASH = 12345;
    const data = Object.assign({}, testData.emptyPin);
    data.hash = '' + HASH;
    const data2 = Object.assign({}, testData.filledPin);
    data2.hash = '' + HASH;
    const HASH2 = 22222;

    it('should receive same hash in response data', function(done){
        const client = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify(data))
            },
            emit: {
                'hash': HASH
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
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify(data2))
            },
            emit: {
                'pin-data-upsert': JSON.stringify(data2)
            }
        };

        const client2 = {
            on: {
                'pin-info': socketTester.shouldBeCalledWith((JSON.stringify(data2)))
            },
            emit: {
                'get-pin': HASH
            }
        };

        socketTester.run([client1, client2], done);
    });
});
