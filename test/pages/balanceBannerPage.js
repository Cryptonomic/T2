const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');


class BalanceBannerPAge extends BasePage {
    constructor(app) {
        super(app);
        this.balanceBannerAddresPartOne = '[data-spectron="address-info"] [data-spectron="tezos-address"] span span:nth-child(1)';
        this.balanceBannerAddresPartTwo = '[data-spectron="address-info"] [data-spectron="tezos-address"] span span:nth-child(2)';
        this.balanceBannerKeyButton = '[data-spectron="key-button"]';
        this.balanceBannerBellButton = '[data-spectron="bell-icon"]';
        this.balanceBannerBellText = 'div=Keep track of your account with the Tezos Notifier Bot on Telegram.';

        this.keySectionAddress = '[data-spectron="account-keys"] [data-spectron="address"]';
        this.keySectionPublicKey = '[data-spectron="account-keys"] [data-spectron="public-key"]';
        this.keySectionSecretMessage = '[data-spectron="account-keys"] [data-spectron="secret-message"]';
        this.keySectionSecretKey = '[data-spectron="account-keys"] [data-spectron="secret-key"]';
        this.keySectionSecretMessageText = 'Be careful when handling the unencrypted secret key. Anyone with your secret key has full access to your balance and can sign operations on your behalf! Click to reveal your secret key.';
        this.keySectionAddressCopyButton = '[data-spectron="account-keys"] [data-spectron="address"] svg';
        this.keySectionCloseButton = '[data-spectron="account-keys"] [data-spectron="close-button"]';


        this.retrieveAccountAddress = async () => {
            const tezAddressOne = await app.client.getText(this.balanceBannerAddresPartOne);
            const tezAddressTwo = await app.client.getText(this.balanceBannerAddresPartTwo);
            const fullTezAddress = tezAddressOne + tezAddressTwo;
            return fullTezAddress
        }

        this.openKeySection = async () => {
            await app.client.click(this.balanceBannerKeyButton);
        }

        this.revealSecretKey = async () => {
            await app.client.click(this.keySectionSecretMessage);
        }

        this.retrieveValuesFromKeySections = async () => {
            const address = await this.app.client.getText(this.keySectionAddress);
            const publicKey = await this.app.client.getText(this.keySectionPublicKey);
            const secretMessage = await this.app.client.getText(this.keySectionSecretMessage);
            await this.revealSecretKey()
            const secretKey = await this.app.client.getText(this.keySectionSecretKey);
            const keysValues = {
                "address": address,
                "publicKey": publicKey,
                "secretMessage": secretMessage,
                "secretKey": secretKey
            }
            return keysValues;
        }

        this.closeKeysSection = async () => {
            await this.app.client.click(this.keySectionCloseButton);
        }
    }

}

module.exports = BalanceBannerPAge;
