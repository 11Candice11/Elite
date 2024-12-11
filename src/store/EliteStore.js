// Store.js
export class EliteStore {
    constructor() {
        this.data = {};
    }

    // Set data with a key-value pair
    set(key, value) {
        this.data[key] = value;
    }

    // Get data by key
    get(key) {
        return this.data[key];
    }

    // Clear data by key
    clear(key) {
        delete this.data[key];
    }
}

// Create a global instance of Store
export const store = new EliteStore();
