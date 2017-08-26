/** Donor Class */
class Donor {
    /**
     * Class Constructor
     * @param {Object} data to initiate
     * @constructor
     */
    constructor(data = {}) {
        // @todo add mongo getter
        this.hash = ''+ data.hash || Math.random().toString();
        // @todo secret hash
        this._upsert(data);
    }

    /**
     * Updates Class instance data
     * @param {Object} data to upsert
     */
    update(data = {}) {
        this._upsert(data);
    }

    /**
     * Updates or cteates Class instance data
     * @param {Object} data to upsert
     * @private
     */
    _upsert(data = {}) {
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.phone = data.phone || '';
        this.address = data.address || '';
        this.bloodGroup = data.bloodGroup; // @todo enum validator
        this.lat = Number(data.lat);
        this.long = Number(data.long);
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
