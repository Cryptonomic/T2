const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class InvokePage extends BasePage {
    constructor(app) {
        super(app);
        this.addDelegationContractButton = '[data-spectron="delegation-label"] svg';

        this.fillInvokeContractForm = async ({
            parameters = undefined,
            format = undefined,
            entryPoint = undefined,
            storageLimit = undefined,
            gas = undefined,
            amount = undefined,
            fee = undefined,
            customFeeInt = undefined,
            password = undefined,
            invoke = undefined,
        }) => {
            if (parameters) {
                await this.app.client.setValue('[data-spectron="parameters"] input', `"${parameters}"`);
            }
            if (format) {
                await this.app.client.click('[data-spectron="format-selector"]');
                if (format === 'micheline') {
                    await this.app.client.click(`ul li:nth-child(1)`);
                }
                if (format === 'michelson') {
                    await this.app.client.click(`ul li:nth-child(2)`);
                }
            }
            if (entryPoint) {
                await this.app.client.setValue('[data-spectron="entry-point"] input', entryPoint);
            }
            if (storageLimit) {
                await this.app.client.setValue('[data-spectron="storage-limit"] input', storageLimit);
            }
            if (gas) {
                await this.app.client.setValue('[data-spectron="gas-limit"] input', gas);
            }
            if (amount) {
                await this.app.client.setValue('[data-spectron="amount"] input', gas);
            }
            if (fee) {
                await this.changeFeeLevelBASE(fee, customFeeInt);
            }
            if (password) {
                await this.app.client.setValue('[data-spectron="wallet-password"] input', password);
            }
            if (invoke) {
                await this.pushButton('[data-spectron="invoke-bottom-button"]');
            }
        };
    }
}

module.exports = InvokePage;
