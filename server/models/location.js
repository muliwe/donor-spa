/** Location Class */
class Location {
    /**
     * Class Constructor
     * @param {Object} geodata to initiate
     * @constructor
     */
    constructor(geodata) {
        this._showedPins = [];
        this._upsert(geodata);
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
     * @param {Boolean} ignoreShown force update
     * @returns {Array} filtered list
     */
    filter(dict = {}, ignoreShown = false) {
        const self = this;

        // convert dict to array
        const array = Object.keys(dict).map(hash => dict[hash]);

        // hide not actual pins and unneeded data
        let filteredArray = array.filter(el => el.isActual(self))
            .map(el => el.stripe());

        // convert it to hash array
        const filteredArrayHashes = filteredArray.map(el => el.hash);

        // find out what is has to be hidden
        const hashesToHide = self._showedPins.filter(hash => !filteredArrayHashes.includes(hash));

        // store cloned array
        const previouslyShowedPins = self._showedPins.slice();

        // hide elements from hash list
        for (let el of filteredArray) {
            if (hashesToHide.includes(el.hash)) {
                el.hide = true;
            }
        }

        // hide outbound pins from the map
        filteredArray = filteredArray.concat(previouslyShowedPins.filter(hash => !filteredArrayHashes.includes(hash))
            .map(hash => ({
                hash,
                hide: true
            })));

        // re-define pins for good
        self._showedPins = filteredArray.filter(el => !el.hide)
            .map(el => el.hash);

        // push only new or hidden
        return filteredArray.filter(el => !previouslyShowedPins.includes(el.hash) || el.hide || ignoreShown);
    }

    /**
     * Checks if pin is shown for this location
     * @param {String} hash to check
     * @returns {Boolean} if is actual
     */
    isShown(hash) {
        const self = this;

        return self._showedPins.includes(hash);
    }

    /**
     * Finds some locations around given
     * @param {Object} pin given
     * @param {Object} locations dict
     * @returns {Array} of socket ids
     */
    static findAround(pin = {}, locations = {}) {
        return Object.keys(locations).filter(hash => locations[hash].isShown(pin.hash));
    }
}

module.exports = Location;
