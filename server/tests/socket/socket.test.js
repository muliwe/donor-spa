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

describe('Sockets', function() {
    it('should receive same hash after connect', function(done){
        const client = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith('{"hash":"12345","firstName":"","lastName":"","phone":"","address":"","lat":null,"long":null,"deleted":false}')
            },
            emit: {
                'hash': '12345'
            }
        };

        socketTester.run([client], done);
    });
});
