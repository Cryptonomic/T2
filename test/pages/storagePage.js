const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class StoragePage extends BasePage {
    constructor(app) {
        super(app);
        this.addDelegationContractButton = '[data-spectron="delegation-label"] svg';
        this.retrieveStorageContent = async () => {
            const storageCode = await this.app.client.getText('[data-spectron="code-storage"]');
            return storageCode;
        };
    }
}

module.exports = StoragePage;
