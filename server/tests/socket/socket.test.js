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
    it('should receive same hash in response data', function(done){
        const client = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify({
                    hash: '12345',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    address: '',
                    lat: null,
                    long: null,
                    deleted: false
                }))
            },
            emit: {
                'hash': 12345
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
                'get-pin': 222222
            }
        };

        socketTester.run([client], done);
    });

    it('should receive updated pin data', function(done){
        const client1 = {
            on: {
                'pin-data': socketTester.shouldBeCalledWith(JSON.stringify({
                    hash: '12345',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '12345678901',
                    address: 'address',
                    lat: 1.00,
                    long: 2.00,
                    deleted: true
                }))
            },
            emit: {
                'pin-data-upsert': JSON.stringify({
                    hash: '12345',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '12345678901',
                    address: 'address',
                    lat: 1.00,
                    long: 2.00,
                    deleted: true
                })
            }
        };

        const client2 = {
            on: {
                'pin-info': socketTester.shouldBeCalledWith((JSON.stringify({
                    hash: '12345',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '12345678901',
                    address: 'address',
                    lat: 1.00,
                    long: 2.00,
                    deleted: true
                })))
            },
            emit: {
                'get-pin': 12345
            }
        };

        socketTester.run([client1, client2], done);
    });
});
