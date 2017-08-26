/** Location Class */
class Location {
    /**
     * Class Constructor
     * @param {Object} geodata to initiate
     * @constructor
     */
    constructor(geodata) {
        this._showedPins = [];
        this._upsert(data);
    }

    /**
     * Updates Class instance data
     * @param {Object} geodata to upsert
     */
    update(geodata) {
        this._upsert(geodata);
    }

    /**
     * Updates or cteates Class instance data
     * @param {Object} data to upsert
     * @private
     */
    _upsert(data) {
        // @todo add validation
        this.fromLat = Number(data.fromLat);
        this.fromLong = Number(data.fromLong);
        this.toLat = Number(data.toLat);
        this.toLong = Number(data.toLong);
    }

    /**
     * Filters some external model instances list
     * @param {Object} dict to filter
     * @returns {Array} filtered list
     */
    filter(dict = {}) {
        const self = this;

        // convert dict to array
        const array = Object.keys(dict).map(hash => dict[hash]);

        // hide not actual pins and unneeded data
        const filteredArray = array.filter(el => el.isActual(self))
            .map(el => el.stripe());

        // convert it to hash array
        const filteredArrayHashes = filteredArray.map(el => el.hash);

        // find out what is has to be hidden
        const hashesToHide = self._showedPins.filter(el => !filteredArrayHashes.includes(el.hash))
            .map(el => el.hash);

        // store cloned array
        const previouslyShowedPins = self._showedPins.slice();

        // hide elements from hash list
        filteredArray.forEach(el => {
            if (hashesToHide.includes(el.hash)) {
                el.hide = true;
            }
        });

        // re-define pins for good
        self._showedPins = filteredArray.filter(el => !el.hide)
            .map(el => el.hash);

        // push only new or hidden
        return filteredArray.filter(el => !previouslyShowedPins.includes(el.hash) || el.hide);
    }
}

module.exports = Location;
