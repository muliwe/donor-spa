const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const donorSchema = new Schema({
    hash: {type: String, unique: true},
    firstName: {type: String, default: '', trim: true},
    lastName: {type: String, default: '', trim: true},
    email: {type: String, default: '', trim: true},
    phone: {type: String, default: '', trim: true},
    address: {type: String, default: '', trim: true},
    lat: {type: Number, default: 0},
    long: {type: Number, default: 0},
    ip: {type: String, default: '0.0.0.0', trim: true},
    deleted: {type: Boolean, default: false}
});

donorSchema.set('validateBeforeSave', true);

donorSchema.path('hash').validate(value => {
    return value.length > 5;
});

module.exports = mongoose.model('Donor', donorSchema);
