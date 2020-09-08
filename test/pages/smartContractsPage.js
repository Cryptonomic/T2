const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class SmartContractsPage extends BasePage {
    constructor(app) {
        super(app);
        this.addDelegationContractButton = '[data-spectron="delegation-label"] svg';

        // [data-spectron="deploy-contract-section"]
        // [data-spectron="code-area"] #micheline-input
        // [data-spectron="storage"] input
        // [data-spectron="format-selector"] svg
        // "span=micheline"
        // [data-spectron="gas"] input
        // [data-spectron="deploy-contract-section"] [data-spectron="wallet-password"]

        this.fillDeployContractForm = async ({
            smartContract = undefined,
            storage = undefined,
            type = undefined,
            storageLimit = undefined,
            gas = undefined,
            password = undefined,
            deploy = undefined,
        }) => {
            if (storage) {
                await this.app.client.setValue('[data-spectron="storage"] input', storage);
            }
            if (storageLimit) {
                await this.app.client.setValue('[data-spectron="storage-limit"] input', storageLimit);
            }
            if (type) {
                await this.app.client.click('[data-spectron="format-selector"]');
                if (type === 'micheline') {
                    await this.app.client.click(`ul li:nth-child(1)`);
                }
                if (type === 'michelson') {
                    await this.app.client.click(`ul li:nth-child(2)`);
                }
            }
            if (gas) {
                await this.app.client.setValue('[data-spectron="gas"] input', gas);
            }
            if (password) {
                await this.app.client.setValue('[data-spectron="deploy-contract-section"] [data-spectron="wallet-password"] input', password);
            }
            if (smartContract) {
                await this.app.client.setValue('[data-spectron="code-area"] #micheline-input', smartContract);
                await sleepApp(3000);
            }
            if (deploy) {
                await this.pushButton('[data-spectron="deploy-button"]');
            }
        };
    }
}

module.exports = SmartContractsPage;
