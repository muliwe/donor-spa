const emptyPin = {
    hash: '12345',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    lat: null,
    long: null,
    ip: '0.0.0.0',
    deleted: false
};

const filledPin = {
    hash: '12345',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@test.com',
    phone: '+12 345 6789 012',
    address: 'address',
    bloodGroup: 'A+',
    lat: 1.00,
    long: 2.00,
    ip: '0.0.0.0',
    deleted: true
};

const location = {
    fromLat: 0.00,
    fromLong: 0.00,
    toLat: 2.00,
    toLong: 3.00
};

const location2 = {
    fromLat: 4.00,
    fromLong: 4.00,
    toLat: 5.00,
    toLong: 5.00
};

module.exports = {
    emptyPin,
    filledPin,
    location,
    location2
};
