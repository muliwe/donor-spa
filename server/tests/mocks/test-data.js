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

module.exports = {
    emptyPin,
    filledPin
};
