const emptyPin = {
    hash: '12345',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    lat: null,
    long: null,
    deleted: false
};

const filledPin = {
    hash: '12345',
    firstName: 'John',
    lastName: 'Doe',
    phone: '12345678901',
    address: 'address',
    lat: 1.00,
    long: 2.00,
    deleted: true
};

const location = {
    fromLat: 0.00,
    fromLong: 0.00,
    toLat: 2.00,
    toLong: 3.00
};

module.exports = {
    emptyPin,
    filledPin,
    location
};
