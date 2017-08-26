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
    bloodGroup: 'A+',
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
