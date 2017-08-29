class DonorMongo {
    constructor() {
    }

    static find() {
        return {
            exec: cb => cb(null, [])
        }
    }

    save() {
    }
}

module.exports = DonorMongo;
