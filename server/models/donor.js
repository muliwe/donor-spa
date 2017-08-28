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
     */
    update(data = {}, ip = '0.0.0.0') {
        this._upsert(data, ip);
    }

    /**
     * Updates or cteates Class instance data
     * @param {Object} data to upsert
     * @param {String} ip of the client
     * @private
     */
    _upsert(data = {}, ip = '0.0.0.0') {
        // @todo add validation here
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
