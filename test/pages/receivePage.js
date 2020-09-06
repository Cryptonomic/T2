const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class ReceivePage extends BasePage {
    constructor(app) {
        super(app);
        this.receiveAddresPartOne = '[data-spectron="address-info"] [data-spectron="tezos-address"] span span:nth-child(1)';
        this.receiveAddresPartTwo = '[data-spectron="address-info"] [data-spectron="tezos-address"] span span:nth-child(2)';

        this.receiveReceiveAddress = async () => {
            const addressOne = await this.app.client.getText(this.receiveAddresPartOne);
            const addressTwo = await this.app.client.getText(this.receiveAddresPartTwo);
            const recieveAddress = addressOne + addressTwo;
            return recieveAddress
        }
    }

}

module.exports = ReceivePage;
