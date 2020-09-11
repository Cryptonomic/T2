const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class TransactionPage extends BasePage {
    constructor(app) {
        super(app);
        this.firstTransactionType = '[data-spectron="transaction-daily"] [data-spectron="single-transaction"]:nth-child(2) [data-spectron="transaction-type"]';
        this.firstTransactionHour =
            '[data-spectron="transaction-daily"] [data-spectron="single-transaction"]:nth-child(2) [data-spectron="transaction-date-hour"]';

        this.returnLastTransaction = async () => {
            const date = await this.app.client.getText('[data-spectron="transaction-date"]');
            const hour = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
            const type = await this.app.client.getText('[data-spectron="transaction-type"]');
            const addressOne = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(1)');
            const addressTwo = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(2)');
            const address = addressOne[0] + addressTwo[0];
            const amount = await this.app.client.getText('[data-spectron="tezos-amount"]');

            const fee = await this.app.client.getText('[data-spectron="fee"] span:nth-child(2)');
            const transactionData = {
                date: date[0],
                hour: hour[0],
                type: type[0],
                address: address,
                amount: amount[0],
                fee: fee[0].slice(0, -2),
            };
            return transactionData;
        };

        this.returnLastTransactionHours = async () => {
            let transactionHoursList = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
            return transactionHoursList[0];
        };

        this.waitUntilPendingTransactionFinished = async function () {
            let refreshApp = this.refreshApp;
            let returnLastTransactionHours = this.returnLastTransactionHours;
            const innerCondidion = async function () {
                await refreshApp();
                let status = await returnLastTransactionHours();
                return status.includes('Pending') !== true;
            };
            await this.app.client.waitUntil(innerCondidion, 1000 * 60 * 3, 'transaction still pending', 1000 * 30);
        };
    }
}

module.exports = TransactionPage;
