const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class TokenPage extends BasePage {
    constructor(app) {
        super(app);
        this.sendRecipientAddressInput = '[data-spectron="recipient-address"] input';
        this.sendBottomButton = '[data-spectron="token-send-bottom-button"]';
        this.walletPassword = '[data-spectron="password-input"] input';
        this.recipientInputAlert = '[data-spectron="token-recipient-address"] p';

        this.retrieveTokenBalanceBannerData = async () => {
            const tokenPageTitle = await this.app.client.getText('[data-spectron="token-name"]');
            const addressPartOne = await this.app.client.getText(
                '[data-spectron="token-balance-banner"] [data-spectron="tezos-address"] span span:nth-child(1)'
            );
            const addressPartTwo = await this.app.client.getText(
                '[data-spectron="token-balance-banner"] [data-spectron="tezos-address"] span span:nth-child(2)'
            );
            const tokenAddress = addressPartOne + addressPartTwo;
            const tokenAddressInfo = await this.app.client.getText('[data-spectron="token-address-info"]');
            const tokenFee = '[data-spectron="fee"] span:nth-child(2)';
            const ballanceBannerInfo = {
                title: tokenPageTitle[0],
                addres: tokenAddress,
                addresInfo: tokenAddressInfo,
                tokenFee: tokenFee,
            };
            return ballanceBannerInfo;
        };

        this.sendTokens = async ({
            recipientAddress = undefined,
            amount = undefined,
            fee = undefined,
            customFeeInt = undefined,
            walletPassword = undefined,
            send = true,
        }) => {
            if (recipientAddress) {
                await app.client.setValue('[data-spectron="token-recipient-address"] input', recipientAddress);
                await this.buttonEnabledFalse(this.sendBottomButton);
            }
            if (amount) {
                await app.client.setValue('[data-spectron="token-amount-send"] input', amount);
                await this.buttonEnabledFalse(this.sendBottomButton);
            }
            if (fee) {
                await this.changeFeeLevelBASE(fee, customFeeInt);
                await this.buttonEnabledFalse(this.sendBottomButton);
            }
            if (walletPassword) {
                await app.client.setValue(this.walletPassword, walletPassword);
                if (!recipientAddress || !amount) {
                    await this.buttonEnabledFalse(this.sendBottomButton);
                }
            }
            if (send) {
                await this.pushButton(this.sendBottomButton);
            }
        };

        // tokens recieve
        this.returnLastTokenTransaction = async () => {
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
    }
}

module.exports = TokenPage;
