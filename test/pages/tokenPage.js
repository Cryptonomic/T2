const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class TokenPage extends BasePage {
    constructor(app) {
        super(app)
        this.sendRecipientAddressInput = '[data-spectron="recipient-address"] input';
        this.tokenFeeSection = '[data-spectron="fee-container"]';
        this.tokenLowFee = 'ul li:nth-child(1)';
        this.tokenMediumFee = 'ul li:nth-child(2)';
        this.tokenHighFee = 'ul li:nth-child(3)';
        this.selectedFeeValue = '[data-spectron="selected-fee-value"]';
        this.tokenSendBottomButton = '[data-spectron="token-send-bottom-button"]';
        this.tokenWalletPassword = '[data-spectron="password-input"] input';
        this.tokenRecipientInputAlert = '[data-spectron="token-recipient-address"] p'


        this.navigetToTokenSection = async (tokenName) => {
            await this.app.client.click(`[data-spectron="token-title"]=${tokenName}`)
        }

        this.retrieveTokenBalanceBannerData = async () => {
            const tokenPageTitle = await this.app.client.getText('[data-spectron="token-name"]');
            const addressPartOne = await this.app.client.getText('[data-spectron="token-balance-banner"] [data-spectron="tezos-address"] span span:nth-child(1)');
            const addressPartTwo = await this.app.client.getText('[data-spectron="token-balance-banner"] [data-spectron="tezos-address"] span span:nth-child(2)');
            const tokenAddress = addressPartOne + addressPartTwo;
            const tokenAddressInfo = await this.app.client.getText('[data-spectron="token-address-info"]');
            const ballanceBannerInfo = {
                title: tokenPageTitle,
                addres: tokenAddress,
                addresInfo: tokenAddressInfo
            }
            return ballanceBannerInfo;
        }

        this.changeFeeLevel = async (feeLevel) => {
            await this.app.client.click(this.tokenFeeSection);
            switch (feeLevel) {
                case "Low":
                    await this.app.client.click(this.tokenLowFee); // take lowest fee
                    const selectedFee = await this.app.client.getText(this.selectedFeeValue)
                    assert.equal(selectedFee.includes("Low Fee"), true)
                    break;
                case "Medium":
                    await this.app.client.click(this.tokenMediumFee); // take lowest fee
                    break;
                case "High":
                    await this.app.client.click(this.tokenHighFee); // take lowest fee
                    break;
                default:
                    await this.app.client.click(this.tokenLowFee);
            }
        }

        this.sendTokens = async ({
            recipientAddress = undefined,
            amount = undefined,
            fee = undefined,
            walletPassword = undefined,
            send = true
        }) => {
            if (recipientAddress) {
                await app.client.setValue('[data-spectron="token-recipient-address"] input', recipientAddress);
                await this.buttonEnabledFalse(this.tokenSendBottomButton);
            }
            if (amount) {
                await app.client.setValue('[data-spectron="token-amount-send"] input', amount);
                await this.buttonEnabledFalse(this.tokenSendBottomButton);
            }
            if (fee) {
                await this.changeFeeLevel(fee)
                await this.buttonEnabledFalse(this.tokenSendBottomButton);
            }
            if (walletPassword) {
                await app.client.setValue(this.tokenWalletPassword, walletPassword);
                if (!recipientAddress || !amount) {
                    await this.buttonEnabledFalse(this.tokenSendBottomButton);
                }
            }
            if (send) {
                await this.pushButton(this.tokenSendBottomButton);
            }
        }

        // tokens recieve
        this.returnLastTokenTransaction = async () => {
            const date = await this.app.client.getText('[data-spectron="transaction-date"]');
            const hour = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
            const type = await this.app.client.getText('[data-spectron="transaction-type"]');
            const addressOne = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(1)');
            const addressTwo = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(2)');
            const address = addressOne[0] + addressTwo[0];
            const amount = await this.app.client.getText('[data-spectron="tezos-amount"]');

            let fee = 0;
            if (type === 'Sentto') {
                fee = await this.app.client.getText('[data-spectron="fee"] span:nth-child(2)');
            }
            const transactionData = {
                date: date,
                hour: hour[0],
                type: type[0],
                address: address,
                amount: amount[0],
                fee: fee[0]
            };
            return transactionData;
        };
    }
}

module.exports = TokenPage;
