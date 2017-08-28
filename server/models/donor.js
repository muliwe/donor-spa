/** Donor Class */
class Donor {
    /**
     * Class Constructor
     * @param {Object} data to initiate
     * @param {String} ip of the client
     * @constructor
     */
    constructor(data = {}, ip = '0.0.0.0') {
        // @todo add mongo getter
        this.hash = '' + data.hash || Math.random().toString().substr(2);
        // @todo secret hash
        this._upsert(data, ip);
    }

    /**
     * Updates Class instance data
     * @param {Object} data to upsert
     * @param {String} ip of the client
     * @returns {String} error message
     */
    update(data = {}, ip = '0.0.0.0') {
        return this._upsert(data, ip);
    }

    /**
     * Updates or cteates Class instance data
     * @param {Object} data to upsert
     * @param {String} ip of the client
     * @returns {String} error message
     * @private
     */
    _upsert(data = {}, ip = '0.0.0.0') {
        const err = this.validate(data);

        if (err) {
            this.firstName = '';
            this.lastName = '';
            this.email = '';
            this.phone = '';
            this.address = '';
            this.bloodGroup = '0(I)+';
            this.lat = NaN;
            this.long = NaN;
            this.ip = ip;
            this.deleted = true;

            return err;
        }

        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.address = data.address || '';
        this.bloodGroup = data.bloodGroup;
        this.lat = Number(data.lat);
        this.long = Number(data.long);
        this.ip = ip;
        this.deleted = !!data.deleted || false;
        // @todo add mongo setter

        return err;
    }

    /**
     * Checks if instance data
     * @param {Object} data to check
     * @returns {String} if is not valid
     */
    validate(data) {
        if ((data.firstName + '').length < 1) {
            return 'First Name is required';
        }

        if ((data.lastName + '').length < 2) {
            return 'Last Name is required';
        }

        if (!(data.email + '').match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
            return 'Email is invalid';
        }

        if (!(data.phone + '').match(/(\+|00)(\d\d*) (\d{3}) (\d{4}) (\d{3})$/i)) {
            return 'Phone is invalid';
        }
    }

    /**
     * Checks if instance data is actual for the Location
     * @param {Object} location to use
     * @returns {Boolean} if is actual
     */
    isActual(location = {}) {
        const self = this;

        return !self.deleted &&
            this.firstName && this.lastName && this.phone && this.address && this.bloodGroup &&
            Number(self.lat) && Number(self.long) &&
            self.lat >= location.fromLat && self.lat <= location.toLat &&
            self.long >= location.fromLong && self.long <= location.toLong;
    }

    /**
     * Stripes extra data
     * @returns {Object} reduced
     */
    stripe() {
        const self = this;

        return {
            hash: self.hash,
            lat: self.lat,
            long: self.long,
            bloodGroup: self.bloodGroup,
            hide: false
        };
    }
}

module.exports = Donor;
